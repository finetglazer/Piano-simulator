import React, { useState, useEffect, useCallback } from 'react';
import './PianoKeyboard.css';

const PianoKeyboard = ({ pianoEngine, onNoteOn, onNoteOff }) => {
    const [activeNotes, setActiveNotes] = useState({});

    // Define piano range (88 keys from A0 to C8)
    const generatePianoKeys = () => {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const keys = [];

        // Start with A0, B0
        keys.push({ note: 'A0', type: 'white', index: 0 });
        keys.push({ note: 'A#0', type: 'black', index: 1 });
        keys.push({ note: 'B0', type: 'white', index: 2 });

        // Add all octaves from 1 to 7
        for (let octave = 1; octave <= 7; octave++) {
            notes.forEach((note, i) => {
                const isBlack = note.includes('#');
                keys.push({
                    note: `${note}${octave}`,
                    type: isBlack ? 'black' : 'white',
                    index: keys.length
                });
            });
        }

        // End with C8
        keys.push({ note: 'C8', type: 'white', index: keys.length });

        return keys;
    };

    const pianoKeys = generatePianoKeys();

    // Map computer keyboard keys to piano notes
    const keyboardMapping = {
        'z': 'C4', 's': 'C#4', 'x': 'D4', 'd': 'D#4', 'c': 'E4', 'v': 'F4',
        'g': 'F#4', 'b': 'G4', 'h': 'G#4', 'n': 'A4', 'j': 'A#4', 'm': 'B4',
        ',': 'C5', 'l': 'C#5', '.': 'D5', ';': 'D#5', '/': 'E5',
        'q': 'C5', '2': 'C#5', 'w': 'D5', '3': 'D#5', 'e': 'E5', 'r': 'F5',
        '5': 'F#5', 't': 'G5', '6': 'G#5', 'y': 'A5', '7': 'A#5', 'u': 'B5',
        'i': 'C6', '9': 'C#6', 'o': 'D6', '0': 'D#6', 'p': 'E6', '[': 'F6',
        '=': 'F#6', ']': 'G6',
    };

    // Handle mouse/touch interaction with piano keys
    const handleMouseDown = (note) => {
        if (!pianoEngine) return;

        setActiveNotes(prev => ({ ...prev, [note]: true }));

        // Use the onNoteOn prop if provided, otherwise call pianoEngine directly
        if (onNoteOn) {
            onNoteOn(note, 0.75);
        } else {
            pianoEngine.playNote(note, 0.75);
        }
    };

    const handleMouseUp = (note) => {
        if (!pianoEngine) return;

        setActiveNotes(prev => {
            const updated = { ...prev };
            delete updated[note];
            return updated;
        });

        // Use the onNoteOff prop if provided, otherwise call pianoEngine directly
        if (onNoteOff) {
            onNoteOff(note);
        } else {
            pianoEngine.stopNote(note);
        }
    };

    // Handle keyboard events
    const handleKeyDown = useCallback((e) => {
        if (e.repeat || !pianoEngine) return; // Prevent repeating notes

        const note = keyboardMapping[e.key.toLowerCase()];
        if (note) {
            setActiveNotes(prev => ({ ...prev, [note]: true }));

            // Use the onNoteOn prop if provided, otherwise call pianoEngine directly
            if (onNoteOn) {
                onNoteOn(note, 0.75);
            } else {
                pianoEngine.playNote(note, 0.75);
            }
        }

        // Sustain pedal using spacebar
        if (e.code === 'Space') {
            pianoEngine.setSustain(true);
        }
    }, [pianoEngine, keyboardMapping, onNoteOn]);

    const handleKeyUp = useCallback((e) => {
        if (!pianoEngine) return;

        const note = keyboardMapping[e.key.toLowerCase()];
        if (note) {
            setActiveNotes(prev => {
                const updated = { ...prev };
                delete updated[note];
                return updated;
            });

            // Use the onNoteOff prop if provided, otherwise call pianoEngine directly
            if (onNoteOff) {
                onNoteOff(note);
            } else {
                pianoEngine.stopNote(note);
            }
        }

        // Release sustain pedal
        if (e.code === 'Space') {
            pianoEngine.setSustain(false);
        }
    }, [pianoEngine, keyboardMapping, onNoteOff]);

    // Add and remove keyboard event listeners
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleKeyDown, handleKeyUp]);

    return (
        <div className="piano-keyboard">
            <div className="piano-key-help">
                Use your computer keyboard or click the keys to play. Spacebar = sustain pedal
            </div>
            <div className="piano-keys">
                {pianoKeys.map((key) => (
                    <div
                        key={key.note}
                        className={`piano-key ${key.type} ${activeNotes[key.note] ? 'active' : ''}`}
                        data-note={key.note}
                        onMouseDown={() => handleMouseDown(key.note)}
                        onMouseUp={() => handleMouseUp(key.note)}
                        onMouseLeave={() => activeNotes[key.note] && handleMouseUp(key.note)}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            handleMouseDown(key.note);
                        }}
                        onTouchEnd={() => handleMouseUp(key.note)}
                    >
                        <div className="key-label">{key.note}</div>
                        {keyboardMapping && Object.entries(keyboardMapping).find(([k, v]) => v === key.note) && (
                            <div className="key-shortcut">
                                {Object.entries(keyboardMapping).find(([k, v]) => v === key.note)[0]}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PianoKeyboard;
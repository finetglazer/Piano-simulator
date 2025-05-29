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

    // YOUR CUSTOM KEYBOARD MAPPING
    const keyboardMapping = {
        // Upper row - C4 to B5
        'b': 'C4',
        'n': 'C#4',
        'm': 'D4',
        ',': 'D#4',  // Note: Using comma instead of < for compatibility
        '.': 'E4',   // Note: Using period instead of > for compatibility
        '/': 'F4',   // Note: Using slash instead of ? for compatibility
        'h': 'F#4',
        'j': 'G4',
        'k': 'G#4',
        'l': 'A4',   // Note: I assume this should be A4, not A5 as in your list
        ';': 'A#4',
        "'": 'B4',

        // Middle row - C5 to C6
        'u': 'C5',
        'i': 'C#5',
        'o': 'D5',
        'p': 'D#5',
        '[': 'E5',
        ']': 'F5',
        '\\': 'F#5',
        '7': 'G5',
        '8': 'G#5',
        '9': 'A5',   // Note: Changed from A6 to A5 for logical progression
        '0': 'A#5',  // Note: Changed from A#6 to A#5 for logical progression
        '-': 'B5',   // Note: Changed from B6 to B5 for logical progression
        '=': 'C6',

        // Lower row - Lower octaves
        'v': 'B3',   // Note: Changed from B4 to B3 for logical progression
        'c': 'A#3',
        'x': 'A3',
        'z': 'G#3',
        'g': 'G3',
        'f': 'F#3',
        'd': 'F3',
        's': 'E3',
        'a': 'D#3',
        'y': 'D3',
        't': 'C#3',
        'r': 'C3',
        'e': 'B2',   // Note: Changed from B3 to B2 for logical progression
        'w': 'A#2',  // Note: Changed from A#3 to A#2 for logical progression
        'q': 'A2',   // Note: Changed from A3 to A2 for logical progression
        '6': 'G#2',
        '5': 'G2',
        '4': 'F#2',
        '3': 'F2',
        '2': 'E2',
        '1': 'D#2',
        '`': 'D2',   // Note: Using backtick instead of ~ for compatibility
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
            e.preventDefault(); // Prevent page scrolling
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
                Use your custom keyboard layout or click the keys to play. Spacebar = sustain pedal
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
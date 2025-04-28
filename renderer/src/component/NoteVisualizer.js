import React, { useState, useEffect, useRef } from 'react';
import './NoteVisualizer.css';

const NoteVisualizer = ({ activeNotes = {} }) => {
    const [notesHistory, setNotesHistory] = useState([]);
    const [visibleNotation, setVisibleNotation] = useState('staff'); // 'staff' or 'keyboard'
    const visualizerRef = useRef(null);

    // Add notes to the history when they're played
    useEffect(() => {
        const newActiveNotes = Object.keys(activeNotes).filter(note => activeNotes[note]);

        if (newActiveNotes.length > 0) {
            // Add newly active notes to the history
            const newNotesWithTimestamp = newActiveNotes.map(note => ({
                note,
                timestamp: Date.now(),
                id: `${note}-${Date.now()}-${Math.random()}`
            }));

            setNotesHistory(prev => [...prev, ...newNotesWithTimestamp].slice(-30)); // Keep only the last 30 notes
        }
    }, [activeNotes]);

    // Auto-scroll the notes list when new notes are added
    useEffect(() => {
        if (visualizerRef.current && notesHistory.length > 0) {
            const container = visualizerRef.current.querySelector('.notes-list');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }, [notesHistory]);

    // Parse note to get the octave (number) and note name (letter)
    const parseNote = (noteString) => {
        const match = noteString.match(/([A-G]#?)(\d+)/);
        if (!match) return { note: '', octave: 0 };

        const [, note, octave] = match;
        return { note, octave: parseInt(octave) };
    };

    // Get a color for a note based on its name
    const getNoteColor = (noteName) => {
        const colors = {
            'C': '#FF6B6B', 'C#': '#FF9E7A',
            'D': '#FFBB86', 'D#': '#FFE066',
            'E': '#A5D5A5',
            'F': '#66B3FF', 'F#': '#8C9EFF',
            'G': '#B39DDB', 'G#': '#D091DB',
            'A': '#F48FB1', 'A#': '#F06292',
            'B': '#CE93D8'
        };

        // Extract the base note (without octave)
        const baseNote = noteName.match(/([A-G]#?)/)[0];
        return colors[baseNote] || '#888';
    };

    // Toggle between staff and keyboard visualization
    const toggleVisualization = () => {
        setVisibleNotation(prev => prev === 'staff' ? 'keyboard' : 'staff');
    };

    // Calculate position for the note on the staff
    const calculateStaffPosition = (noteName, octave) => {
        // Simplified position mapping
        const noteOrder = {
            'C': 0, 'C#': 0,
            'D': 1, 'D#': 1,
            'E': 2,
            'F': 3, 'F#': 3,
            'G': 4, 'G#': 4,
            'A': 5, 'A#': 5,
            'B': 6
        };

        // Base position calculations
        let position = 0;
        if (noteName in noteOrder) {
            position = (7 - noteOrder[noteName]) + (octave - 4) * 7;
        }

        // Convert to percentage for positioning
        return 50 - position * 5; // Adjust multiplier as needed
    };

    return (
        <div className="note-visualizer" ref={visualizerRef}>
            <div className="visualizer-header">
                <div className="visualizer-title">Notes Played</div>
                <button
                    className="visualizer-toggle-button"
                    onClick={toggleVisualization}
                >
                    {visibleNotation === 'staff' ? 'Show Keyboard' : 'Show Staff'}
                </button>
            </div>

            {visibleNotation === 'staff' ? (
                <div className="staff-notation">
                    <div className="staff">
                        {/* Staff lines */}
                        <div className="staff-line"></div>
                        <div className="staff-line"></div>
                        <div className="staff-line"></div>
                        <div className="staff-line"></div>
                        <div className="staff-line"></div>

                        {/* Middle C line (ledger line) */}
                        <div className="ledger-line"></div>

                        {/* Clef */}
                        <div className="treble-clef">𝄞</div>
                        <div className="bass-clef">𝄢</div>

                        {/* Render notes on the staff */}
                        <div className="notes-container">
                            {notesHistory.map(({ note, id }, index) => {
                                const { note: noteName, octave } = parseNote(note);
                                const topPosition = calculateStaffPosition(noteName, octave);
                                const noteColor = getNoteColor(noteName);

                                return (
                                    <div
                                        key={id}
                                        className="staff-note"
                                        style={{
                                            top: `${topPosition}%`,
                                            left: `${5 + (index * 3)}%`,
                                            backgroundColor: noteColor,
                                            opacity: 1 - (index * 0.02), // Fade older notes
                                        }}
                                    >
                                        <span className="note-name">{note}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="keyboard-visualization">
                    <div className="mini-keyboard">
                        {/* Simplified keyboard representation */}
                        {Array.from({ length: 24 }, (_, i) => {
                            const keyIndex = i % 12;
                            const isBlack = [1, 3, 6, 8, 10].includes(keyIndex);
                            const octave = Math.floor(i / 12) + 3; // Start from C3
                            const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                            const noteName = `${noteNames[keyIndex]}${octave}`;

                            // Check if this note is in activeNotes
                            const isActive = activeNotes[noteName];

                            // Find if this note was recently played
                            const recentNote = notesHistory.find(note => note.note === noteName);
                            const wasRecentlyPlayed = recentNote !== undefined;

                            return (
                                <div
                                    key={i}
                                    className={`mini-key ${isBlack ? 'black' : 'white'} ${isActive ? 'active' : ''} ${wasRecentlyPlayed ? 'recently-played' : ''}`}
                                    data-note={noteName}
                                >
                                    {!isBlack && <span className="mini-key-label">{noteName}</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="notes-list">
                {notesHistory.length === 0 ? (
                    <div className="no-notes">Play some notes to see them here!</div>
                ) : (
                    notesHistory.map(({ note, id, timestamp }, index) => {
                        const { note: noteName } = parseNote(note);
                        const noteColor = getNoteColor(noteName);

                        // Calculate time difference
                        const now = Date.now();
                        const secondsAgo = Math.floor((now - timestamp) / 1000);
                        const timeDisplay = secondsAgo < 60
                            ? `${secondsAgo}s ago`
                            : `${Math.floor(secondsAgo / 60)}m ${secondsAgo % 60}s ago`;

                        return (
                            <div
                                key={id}
                                className="note-entry"
                                style={{
                                    borderLeft: `4px solid ${noteColor}`
                                }}
                            >
                                <span className="note-entry-name">{note}</span>
                                <span className="note-entry-time">{timeDisplay}</span>
                            </div>
                        );
                    }).reverse()
                )}
            </div>
        </div>
    );
};

export default NoteVisualizer;
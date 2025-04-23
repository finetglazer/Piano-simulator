import React, { useState, useEffect } from 'react';
import './NoteVisualizer.css';

const NoteVisualizer = ({ activeNotes = {} }) => {
    const [notesHistory, setNotesHistory] = useState([]);

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

            setNotesHistory(prev => [...prev, ...newNotesWithTimestamp].slice(-20)); // Keep only the last 20 notes
        }
    }, [activeNotes]);

    // Parse note to get the octave (number) and note name (letter)
    const parseNote = (noteString) => {
        const match = noteString.match(/([A-G]#?)(\d+)/);
        if (!match) return { note: '', octave: 0 };

        const [, note, octave] = match;
        return { note, octave: parseInt(octave) };
    };

    return (
        <div className="note-visualizer">
            <div className="visualizer-title">Notes Played</div>

            <div className="staff-notation">
                <div className="staff">
                    {/* Staff lines */}
                    <div className="staff-line"></div>
                    <div className="staff-line"></div>
                    <div className="staff-line"></div>
                    <div className="staff-line"></div>
                    <div className="staff-line"></div>

                    {/* Render notes on the staff */}
                    <div className="notes-container">
                        {notesHistory.map(({ note, id }, index) => {
                            const { note: noteName, octave } = parseNote(note);

                            // Calculate vertical position based on the note and octave
                            // This is a simplified positioning logic and might need adjustment
                            // to correctly place notes on a proper musical staff
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
                            // These values may need adjustment based on your staff display
                            let position = 0;
                            if (noteName in noteOrder) {
                                position = (7 - noteOrder[noteName]) + (octave - 4) * 7;
                            }

                            // Convert to percentage for positioning
                            const topPosition = 50 - position * 5; // Adjust multiplier as needed

                            return (
                                <div
                                    key={id}
                                    className="note"
                                    style={{
                                        top: `${topPosition}%`,
                                        left: `${index * 5}%`,
                                        backgroundColor: noteName.includes('#') ? '#444' : '#000'
                                    }}
                                >
                                    <span className="note-name">{note}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="notes-list">
                {notesHistory.length === 0 ? (
                    <div className="no-notes">Play some notes to see them here!</div>
                ) : (
                    notesHistory.map(({ note, id }, index) => (
                        <div key={id} className="note-entry">
                            {note}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NoteVisualizer;
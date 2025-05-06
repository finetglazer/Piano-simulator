import React from 'react';
import './HelpPanel.css';

const HelpPanel = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="help-overlay">
            <div className="help-panel">
                <div className="help-header">
                    <h2>Piano Simulator Help</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="help-content">
                    <div className="help-section">
                        <h3>Keyboard Controls</h3>
                        <p>You can play piano notes using your computer keyboard:</p>

                        <div className="keyboard-layout">
                            <div className="keyboard-row">
                                <div className="key" data-key="q">Q<br /><span>C5</span></div>
                                <div className="key black" data-key="2">2<br /><span>C#5</span></div>
                                <div className="key" data-key="w">W<br /><span>D5</span></div>
                                <div className="key black" data-key="3">3<br /><span>D#5</span></div>
                                <div className="key" data-key="e">E<br /><span>E5</span></div>
                                <div className="key" data-key="r">R<br /><span>F5</span></div>
                                <div className="key black" data-key="5">5<br /><span>F#5</span></div>
                                <div className="key" data-key="t">T<br /><span>G5</span></div>
                                <div className="key black" data-key="6">6<br /><span>G#5</span></div>
                                <div className="key" data-key="y">Y<br /><span>A5</span></div>
                                <div className="key black" data-key="7">7<br /><span>A#5</span></div>
                                <div className="key" data-key="u">U<br /><span>B5</span></div>
                                <div className="key" data-key="i">I<br /><span>C6</span></div>
                            </div>

                            <div className="keyboard-row">
                                <div className="key" data-key="z">Z<br /><span>C4</span></div>
                                <div className="key black" data-key="s">S<br /><span>C#4</span></div>
                                <div className="key" data-key="x">X<br /><span>D4</span></div>
                                <div className="key black" data-key="d">D<br /><span>D#4</span></div>
                                <div className="key" data-key="c">C<br /><span>E4</span></div>
                                <div className="key" data-key="v">V<br /><span>F4</span></div>
                                <div className="key black" data-key="g">G<br /><span>F#4</span></div>
                                <div className="key" data-key="b">B<br /><span>G4</span></div>
                                <div className="key black" data-key="h">H<br /><span>G#4</span></div>
                                <div className="key" data-key="n">N<br /><span>A4</span></div>
                                <div className="key black" data-key="j">J<br /><span>A#4</span></div>
                                <div className="key" data-key="m">M<br /><span>B4</span></div>
                                <div className="key" data-key=",">,<br /><span>C5</span></div>
                            </div>
                        </div>

                        <div className="control-keys">
                            <div className="key space" data-key="Space">Space Bar<br /><span>Sustain Pedal</span></div>
                        </div>
                    </div>

                    <div className="help-section">
                        <h3>Playing the Piano</h3>
                        <ul>
                            <li><strong>Click</strong> on piano keys or use your computer keyboard to play notes</li>
                            <li>Hold <strong>Space Bar</strong> to use the sustain pedal</li>
                            <li>Adjust volume and reverb in the Settings panel</li>
                        </ul>
                    </div>

                    <div className="help-section">
                        <h3>Recording</h3>
                        <ul>
                            <li>Click <strong>Record</strong> to start recording your performance</li>
                            <li>Click <strong>Stop</strong> to end the recording</li>
                            <li>Click <strong>Save</strong> to download your recording as an audio file</li>
                            <li>Recordings are saved in WebM format</li>
                        </ul>
                    </div>

                    <div className="help-section">
                        <h3>Visualization</h3>
                        <ul>
                            <li>Notes are visualized in real-time as they are played</li>
                            <li>Toggle between staff notation and keyboard display</li>
                            <li>Recently played notes are shown in the history list</li>
                        </ul>
                    </div>

                    <div className="help-section">
                        <h3>Keyboard Shortcuts</h3>
                        <table className="shortcuts-table">
                            <tbody>
                            <tr>
                                <td><kbd>Esc</kbd></td>
                                <td>Close dialogs</td>
                            </tr>
                            <tr>
                                <td><kbd>H</kbd></td>
                                <td>Toggle help panel</td>
                            </tr>
                            <tr>
                                <td><kbd>S</kbd></td>
                                <td>Open settings</td>
                            </tr>
                            <tr>
                                <td><kbd>R</kbd></td>
                                <td>Start/stop recording</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="help-footer">
                    <button className="help-button" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default HelpPanel;
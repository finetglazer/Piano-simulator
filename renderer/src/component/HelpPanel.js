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
                        <h3>Custom Keyboard Controls</h3>
                        <p>You can play piano notes using your custom keyboard layout:</p>

                        <div className="keyboard-layout">
                            {/* Top Number Row - Higher octaves */}
                            <div className="keyboard-row">
                                <div className="key" data-key="`">~<br /><span>D2</span></div>
                                <div className="key" data-key="1">1<br /><span>D#2</span></div>
                                <div className="key" data-key="2">2<br /><span>E2</span></div>
                                <div className="key" data-key="3">3<br /><span>F2</span></div>
                                <div className="key" data-key="4">4<br /><span>F#2</span></div>
                                <div className="key" data-key="5">5<br /><span>G2</span></div>
                                <div className="key" data-key="6">6<br /><span>G#2</span></div>
                                <div className="key" data-key="7">7<br /><span>G5</span></div>
                                <div className="key black" data-key="8">8<br /><span>G#5</span></div>
                                <div className="key" data-key="9">9<br /><span>A5</span></div>
                                <div className="key black" data-key="0">0<br /><span>A#5</span></div>
                                <div className="key" data-key="-">-<br /><span>B5</span></div>
                                <div className="key" data-key="=">=<br /><span>C6</span></div>
                            </div>

                            {/* QWERTY Row - Upper octaves */}
                            <div className="keyboard-row">
                                <div className="key" data-key="q">Q<br /><span>A2</span></div>
                                <div className="key black" data-key="w">W<br /><span>A#2</span></div>
                                <div className="key" data-key="e">E<br /><span>B2</span></div>
                                <div className="key" data-key="r">R<br /><span>C3</span></div>
                                <div className="key black" data-key="t">T<br /><span>C#3</span></div>
                                <div className="key" data-key="y">Y<br /><span>D3</span></div>
                                <div className="key" data-key="u">U<br /><span>C5</span></div>
                                <div className="key black" data-key="i">I<br /><span>C#5</span></div>
                                <div className="key" data-key="o">O<br /><span>D5</span></div>
                                <div className="key black" data-key="p">P<br /><span>D#5</span></div>
                                <div className="key" data-key="[">[<br /><span>E5</span></div>
                                <div className="key" data-key="]">]<br /><span>F5</span></div>
                                <div className="key black" data-key="\">\<br /><span>F#5</span></div>
                            </div>

                            {/* ASDF Row - Middle octaves */}
                            <div className="keyboard-row">
                                <div className="key black" data-key="a">A<br /><span>D#3</span></div>
                                <div className="key" data-key="s">S<br /><span>E3</span></div>
                                <div className="key" data-key="d">D<br /><span>F3</span></div>
                                <div className="key black" data-key="f">F<br /><span>F#3</span></div>
                                <div className="key" data-key="g">G<br /><span>G3</span></div>
                                <div className="key black" data-key="h">H<br /><span>F#4</span></div>
                                <div className="key" data-key="j">J<br /><span>G4</span></div>
                                <div className="key black" data-key="k">K<br /><span>G#4</span></div>
                                <div className="key" data-key="l">L<br /><span>A4</span></div>
                                <div className="key black" data-key=";">;<br /><span>A#4</span></div>
                                <div className="key" data-key="'">'<br /><span>B4</span></div>
                            </div>

                            {/* ZXCV Row - Lower octaves */}
                            <div className="keyboard-row">
                                <div className="key black" data-key="z">Z<br /><span>G#3</span></div>
                                <div className="key" data-key="x">X<br /><span>A3</span></div>
                                <div className="key black" data-key="c">C<br /><span>A#3</span></div>
                                <div className="key" data-key="v">V<br /><span>B3</span></div>
                                <div className="key" data-key="b">B<br /><span>C4</span></div>
                                <div className="key black" data-key="n">N<br /><span>C#4</span></div>
                                <div className="key" data-key="m">M<br /><span>D4</span></div>
                                <div className="key black" data-key=",">,<br /><span>D#4</span></div>
                                <div className="key" data-key=".">.<br /><span>E4</span></div>
                                <div className="key" data-key="/">/<br /><span>F4</span></div>
                            </div>
                        </div>

                        <div className="control-keys">
                            <div className="key space" data-key="Space">Space Bar<br /><span>Sustain Pedal</span></div>
                        </div>

                        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px', fontSize: '13px' }}>
                            <strong>Layout Overview:</strong>
                            <ul style={{ textAlign: 'left', margin: '5px 0', paddingLeft: '20px' }}>
                                <li><strong>Bottom Row (ZXCV...):</strong> Low octaves (G#3 - F4)</li>
                                <li><strong>Middle Row (ASDF...):</strong> Mixed octaves (D#3 - B4)</li>
                                <li><strong>Top Row (QWER... & UIO...):</strong> Higher octaves (A2 - F#5)</li>
                                <li><strong>Number Row (1234...):</strong> Very low & high notes (D2 - C6)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="help-section">
                        <h3>Playing the Piano</h3>
                        <ul>
                            <li><strong>Click</strong> on piano keys or use your custom keyboard layout to play notes</li>
                            <li>Hold <strong>Space Bar</strong> to use the sustain pedal</li>
                            <li>Adjust volume and reverb in the Settings panel</li>
                            <li>Your custom layout provides easy access to multiple octaves</li>
                        </ul>
                    </div>

                    <div className="help-section">
                        <h3>Sheet Music Viewer</h3>
                        <ul>
                            <li>Click <strong>Open Sheet Music</strong> to select a PDF file from your computer</li>
                            <li>Press <strong>Enter</strong> or <strong>Right Arrow</strong> to go to the next page</li>
                            <li>Press <strong>Left Arrow</strong> to go to the previous page</li>
                            <li>Use the <strong>+</strong> and <strong>-</strong> buttons to adjust zoom level</li>
                            <li>Click <strong>Hide</strong> to collapse the sheet music panel</li>
                            <li>Your last opened sheet music and page position will be remembered between sessions</li>
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
                                <td><kbd>Enter</kbd> / <kbd>→</kbd></td>
                                <td>Next sheet music page</td>
                            </tr>
                            <tr>
                                <td><kbd>←</kbd></td>
                                <td>Previous sheet music page</td>
                            </tr>
                            <tr>
                                <td><kbd>Space</kbd></td>
                                <td>Sustain pedal</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="help-section">
                        <h3>Custom Layout Tips</h3>
                        <ul>
                            <li><strong>Home Position:</strong> Place your fingers on ASDF and JKL; for comfortable access to most notes</li>
                            <li><strong>Left Hand:</strong> Use QWER, ASDF, ZXCV rows for bass and accompaniment</li>
                            <li><strong>Right Hand:</strong> Use UIOP, JKL;, M,./ area for melody and higher notes</li>
                            <li><strong>Both Hands:</strong> Number row gives you access to extreme high and low notes</li>
                            <li><strong>Practice:</strong> Start slowly and build muscle memory for your custom layout</li>
                        </ul>
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
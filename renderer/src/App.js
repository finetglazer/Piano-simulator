import React, { useEffect, useState } from 'react';
import './App.css';
import PianoEngine from './audio/PianoEngine';
import PianoSampleLoader from './audio/PianoSampleLoader';
import * as Tone from 'tone';

function App() {
    const [pianoEngine, setPianoEngine] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');

    // Initialize piano when component mounts
    useEffect(() => {
        async function initializePiano() {
            try {
                setLoadingStatus('Starting audio engine...');
                // Start Tone.js audio context
                await Tone.start();

                // Create the piano engine
                const engine = new PianoEngine();
                setPianoEngine(engine);

                setLoadingStatus('Loading piano samples...');
                // Create the sample loader
                const sampleLoader = new PianoSampleLoader();

                // Get sample mapping
                const sampleMapping = await sampleLoader.createSampleMapping();

                // Load samples into the piano engine
                await engine.loadSamples(sampleMapping);

                setLoadingStatus('Ready!');
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to initialize piano:', error);
                setLoadingStatus('Error initializing piano');
            }
        }

        initializePiano();

        // Cleanup when component unmounts
        return () => {
            // Any cleanup code here
        };
    }, []);

    // Function to play a test note
    const playTestNote = () => {
        if (pianoEngine && !isLoading) {
            pianoEngine.playNote('C4', 0.75);
            setTimeout(() => pianoEngine.stopNote('C4'), 1000);
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Piano Simulator</h1>
            </header>
            <main>
                <div className="piano-container">
                    {isLoading ? (
                        <div className="loading-status">
                            {loadingStatus}
                        </div>
                    ) : (
                        <>
                            <div className="piano-placeholder">
                                Piano Keyboard (Coming Soon)
                            </div>
                            <button onClick={playTestNote}>
                                Play Test Note (C4)
                            </button>
                        </>
                    )}
                </div>
                <div className="controls-container">
                    <button className="control-button" disabled={isLoading}>Record</button>
                    <button className="control-button" disabled={isLoading}>Stop</button>
                    <button className="control-button" disabled={isLoading}>Save</button>
                </div>
                <div className="visualization-container">
                    <div className="visualization-placeholder">
                        Note Visualization (Coming Soon)
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
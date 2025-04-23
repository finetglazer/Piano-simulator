import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import PianoEngine from './audio/PianoEngine';
import PianoSampleLoader from './audio/PianoSampleLoader';
import * as Tone from 'tone';

function App() {
    const [pianoEngine, setPianoEngine] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');
    const [samplesLoaded, setSamplesLoaded] = useState(false);

    // Initialize piano when component mounts
    useEffect(() => {
        let isMounted = true;

        async function initializePiano() {
            try {
                // First we need to wait for a user interaction to start audio
                setLoadingStatus('Click anywhere to start audio engine...');

                // Only create the piano engine after Tone.js context is started
                const engine = new PianoEngine();
                if (isMounted) setPianoEngine(engine);

                // Wait for the reverb to be generated
                await new Promise(resolve => setTimeout(resolve, 500));

                if (isMounted) setLoadingStatus('Loading piano samples...');

                // Create the sample loader
                const sampleLoader = new PianoSampleLoader();

                // Get sample mapping
                const sampleMapping = await sampleLoader.createSampleMapping();

                // Load samples into the piano engine
                await engine.loadSamples(sampleMapping);

                // Add a delay to ensure samples are loaded
                await new Promise(resolve => setTimeout(resolve, 1000));

                if (isMounted) {
                    setLoadingStatus('Ready to play!');
                    setIsLoading(false);
                    setSamplesLoaded(true);
                }
            } catch (error) {
                console.error('Failed to initialize piano:', error);
                if (isMounted) setLoadingStatus(`Error: ${error.message}`);
            }
        }

        // When document is clicked, start audio context and initialization
        const startAudio = async () => {
            try {
                await Tone.start();
                console.log('Audio context started');
                document.removeEventListener('click', startAudio);
                initializePiano();
            } catch (error) {
                console.error('Could not start audio context:', error);
                setLoadingStatus(`Error starting audio: ${error.message}`);
            }
        };

        document.addEventListener('click', startAudio);

        // Cleanup when component unmounts
        return () => {
            isMounted = false;
            document.removeEventListener('click', startAudio);
        };
    }, []);

    // Function to play a test note
    const playTestNote = useCallback(() => {
        if (!pianoEngine) {
            console.warn('Piano engine not initialized');
            return;
        }

        if (!samplesLoaded) {
            console.warn('Samples not loaded yet');
            return;
        }

        console.log('Playing test note C4');
        pianoEngine.playNote('C4', 0.75);
        setTimeout(() => pianoEngine.stopNote('C4'), 1000);
    }, [pianoEngine, samplesLoaded]);

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
                            <button
                                onClick={playTestNote}
                                disabled={!samplesLoaded}
                                className="test-note-button"
                            >
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
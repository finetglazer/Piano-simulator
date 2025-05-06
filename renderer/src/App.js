import React, { useEffect, useState, useCallback, useRef } from 'react';
import './App.css';
import OptimizedPianoEngine from './audio/OptimizedPianoEngine';
import PianoSampleLoader from './audio/PianoSampleLoader';
import PianoKeyboard from './component/PianoKeyboard';
import NoteVisualizer from './component/NoteVisualizer';
import RecordingControls from './component/RecordingControls';
import SettingsPanel from './component/SettingsPanel';
import HelpPanel from './component/HelpPanel';
import SettingsStore from './utils/SettingsStore';
import * as Tone from 'tone';

function App() {
    const [pianoEngine, setPianoEngine] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');
    const [samplesLoaded, setSamplesLoaded] = useState(false);
    const [activeNotes, setActiveNotes] = useState({});
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [appSettings, setAppSettings] = useState(null);
    const [theme, setTheme] = useState('light');

    // References for components that need to persist
    const settingsStoreRef = useRef(new SettingsStore());
    const appContainerRef = useRef(null);

    // Initialize app settings when component mounts
    useEffect(() => {
        const settings = settingsStoreRef.current.loadSettings();
        setAppSettings(settings);
        setTheme(settings.theme);
    }, []);

    // Apply theme when it changes
    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }, [theme]);

    // Initialize piano when component mounts
    useEffect(() => {
        let isMounted = true;

        async function initializePiano() {
            try {
                // First we need to wait for a user interaction to start audio
                setLoadingStatus('Click anywhere to start audio engine...');

                // Only create the piano engine after Tone.js context is started
                const engine = new OptimizedPianoEngine();
                if (isMounted) setPianoEngine(engine);

                // Set up the audio chain
                await engine.setupAudio();

                // If we have app settings, apply them to the piano engine
                if (appSettings) {
                    engine.updateSettings({
                        volume: appSettings.volume,
                        reverbWet: appSettings.reverbAmount,
                    });
                }

                if (isMounted) setLoadingStatus('Loading piano samples...');

                // Create the sample loader
                const sampleLoader = new PianoSampleLoader();

                // Get sample mapping
                const sampleMapping = await sampleLoader.createSampleMapping();

                // Load samples into the piano engine
                await engine.loadSamples(sampleMapping);

                if (isMounted) {
                    setLoadingStatus('Ready to play!');
                    setIsLoading(false);
                    setSamplesLoaded(true);

                    // Show help on first load
                    const hasSeenHelp = localStorage.getItem('piano-simulator-seen-help');
                    if (!hasSeenHelp) {
                        setIsHelpOpen(true);
                        localStorage.setItem('piano-simulator-seen-help', 'true');
                    }
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

        // Add keyboard shortcuts for app controls
        const handleKeyDown = (e) => {
            // Ignore if a modifier key is pressed
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            // Avoid capturing when typing in form elements
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

            if (e.key === 'h' || e.key === 'H') {
                setIsHelpOpen(prev => !prev);
            } else if (e.key === 's' || e.key === 'S') {
                setIsSettingsOpen(prev => !prev);
            } else if (e.key === 'Escape') {
                setIsHelpOpen(false);
                setIsSettingsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Cleanup when component unmounts
        return () => {
            isMounted = false;
            document.removeEventListener('click', startAudio);
            window.removeEventListener('keydown', handleKeyDown);

            // Dispose piano engine to free resources
            if (pianoEngine) {
                pianoEngine.dispose();
            }
        };
    }, [appSettings]);

    // Handle settings changes
    const handleSettingsChange = (newSettings) => {
        setAppSettings(newSettings);
        setTheme(newSettings.theme);

        // Apply settings to piano engine if it exists
        if (pianoEngine) {
            pianoEngine.updateSettings({
                volume: newSettings.volume,
                reverbWet: newSettings.reverbAmount,
            });
        }
    };

    // Custom pianoEngine wrapper to track active notes for visualization
    const handleNoteOn = useCallback((note, velocity) => {
        if (!pianoEngine || !samplesLoaded) return;

        setActiveNotes(prev => ({ ...prev, [note]: true }));
        pianoEngine.playNote(note, velocity);
    }, [pianoEngine, samplesLoaded]);

    const handleNoteOff = useCallback((note) => {
        if (!pianoEngine || !samplesLoaded) return;

        setActiveNotes(prev => {
            const updated = { ...prev };
            delete updated[note];
            return updated;
        });
        pianoEngine.stopNote(note);
    }, [pianoEngine, samplesLoaded]);

    return (
        <div className={`App ${theme === 'dark' ? 'dark-theme' : ''}`} ref={appContainerRef}>
            <header className="App-header">
                <h1>Piano Simulator</h1>
                <div className="app-controls">
                    <button
                        className="app-control-button"
                        onClick={() => setIsHelpOpen(true)}
                        title="Help (H)"
                    >
                        ?
                    </button>
                    <button
                        className="app-control-button"
                        onClick={() => setIsSettingsOpen(true)}
                        title="Settings (S)"
                    >
                        ⚙️
                    </button>
                </div>
            </header>
            <main>
                <div className="piano-container">
                    {isLoading ? (
                        <div className="loading-status">
                            {loadingStatus}
                        </div>
                    ) : (
                        <PianoKeyboard
                            pianoEngine={pianoEngine}
                            onNoteOn={handleNoteOn}
                            onNoteOff={handleNoteOff}
                            showLabels={appSettings?.showNoteLabels}
                        />
                    )}
                </div>
                <div className="controls-container">
                    <RecordingControls
                        disabled={isLoading || !samplesLoaded}
                    />
                </div>
                <div className="visualization-container">
                    <NoteVisualizer
                        activeNotes={activeNotes}
                        visualizationMode={appSettings?.visualizationMode || 'staff'}
                    />
                </div>
            </main>

            {/* Settings Panel */}
            <SettingsPanel
                pianoEngine={pianoEngine}
                onSettingsChange={handleSettingsChange}
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {/* Help Panel */}
            <HelpPanel
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
            />

            {/* Version indicator */}
            <div className="app-version">Piano Simulator v1.0.0</div>
        </div>
    );
}

export default App;
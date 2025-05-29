import React, { useEffect, useState, useCallback, useRef } from 'react';
import './App.css';
import OptimizedPianoEngine from './audio/OptimizedPianoEngine';
import PianoSampleLoader from './audio/PianoSampleLoader';
import PianoKeyboard from './component/PianoKeyboard';
import NoteVisualizer from './component/NoteVisualizer';
import RecordingControls from './component/RecordingControls';
import SettingsPanel from './component/SettingsPanel';
import HelpPanel from './component/HelpPanel';
import SheetMusicViewer from './component/SheetMusicViewer';
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
    const [isSheetMusicCollapsed, setIsSheetMusicCollapsed] = useState(false);
    const [audioStarted, setAudioStarted] = useState(false);

    // References for components that need to persist
    const settingsStoreRef = useRef(new SettingsStore());
    const appContainerRef = useRef(null);
    const initializationRef = useRef(false);

    // Initialize app settings when component mounts
    useEffect(() => {
        const settings = settingsStoreRef.current.loadSettings();
        setAppSettings(settings);
        setTheme(settings.theme);

        // Check if sheet music panel was previously collapsed
        const sheetMusicCollapsed = localStorage.getItem('sheetMusicCollapsed');
        if (sheetMusicCollapsed === 'true') {
            setIsSheetMusicCollapsed(true);
        }
    }, []);

    // Save sheet music collapsed state
    useEffect(() => {
        localStorage.setItem('sheetMusicCollapsed', isSheetMusicCollapsed.toString());
    }, [isSheetMusicCollapsed]);

    // Apply theme when it changes
    useEffect(() => {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }, [theme]);

    // Initialize piano engine function
    const initializePiano = useCallback(async () => {
        if (initializationRef.current) return; // Prevent double initialization
        initializationRef.current = true;

        try {
            console.log('🎹 Starting piano initialization...');
            setLoadingStatus('Initializing audio engine...');

            // Create piano engine
            const engine = new OptimizedPianoEngine();
            setPianoEngine(engine);

            // Set up the audio chain
            await engine.setupAudio();
            console.log('✅ Audio engine setup complete');

            // Apply settings if available
            if (appSettings) {
                engine.updateSettings({
                    volume: appSettings.volume,
                    reverbWet: appSettings.reverbAmount,
                });
                console.log('⚙️ Applied settings to engine');
            }

            setLoadingStatus('Loading piano samples...');

            // Create the sample loader
            const sampleLoader = new PianoSampleLoader();

            // Get sample mapping
            const sampleMapping = await sampleLoader.createSampleMapping();
            console.log('📂 Sample mapping created');

            // Load samples into the piano engine
            await engine.loadSamples(sampleMapping);
            console.log('🎵 Piano samples loaded');

            setLoadingStatus('Ready to play!');
            setIsLoading(false);
            setSamplesLoaded(true);

            // Show help on first load
            const hasSeenHelp = localStorage.getItem('piano-simulator-seen-help');
            if (!hasSeenHelp) {
                setTimeout(() => {
                    setIsHelpOpen(true);
                    localStorage.setItem('piano-simulator-seen-help', 'true');
                }, 1000);
            }

            console.log('🎉 Piano initialization complete!');

        } catch (error) {
            console.error('💥 Failed to initialize piano:', error);
            setLoadingStatus(`Error: ${error.message}`);
            setIsLoading(false);
            initializationRef.current = false; // Allow retry
        }
    }, [appSettings]);

    // Handle audio context start
    const startAudio = useCallback(async () => {
        if (audioStarted) return;

        try {
            console.log('🔊 Starting audio context...');
            await Tone.start();
            setAudioStarted(true);
            setLoadingStatus('Audio started! Initializing piano...');
            console.log('✅ Audio context started successfully');

            // Start piano initialization
            setTimeout(() => {
                initializePiano();
            }, 100);

        } catch (error) {
            console.error('❌ Could not start audio context:', error);
            setLoadingStatus(`Error starting audio: ${error.message}`);
        }
    }, [audioStarted, initializePiano]);

    // Set up click listener for audio start
    useEffect(() => {
        if (audioStarted) return;

        const handleUserInteraction = () => {
            startAudio();
            // Remove listeners after first interaction
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };

        // Add multiple event listeners to catch user interaction
        document.addEventListener('click', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);

        return () => {
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
        };
    }, [audioStarted, startAudio]);

    // Add keyboard shortcuts for app controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore if a modifier key is pressed
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            // Avoid capturing when typing in form elements
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

            // Only handle Escape key
            if (e.key === 'Escape') {
                setIsHelpOpen(false);
                setIsSettingsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pianoEngine) {
                console.log('🧹 Cleaning up piano engine');
                pianoEngine.dispose();
            }
        };
    }, [pianoEngine]);

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
            console.log('⚙️ Settings applied to piano engine');
        }
    };

    // Custom pianoEngine wrapper to track active notes for visualization
    const handleNoteOn = useCallback((note, velocity) => {
        if (!pianoEngine || !samplesLoaded) {
            console.warn('⚠️ Piano engine not ready for note:', note);
            return;
        }

        console.log('🎵 Playing note:', note);
        setActiveNotes(prev => ({ ...prev, [note]: true }));
        pianoEngine.playNote(note, velocity);
    }, [pianoEngine, samplesLoaded]);

    const handleNoteOff = useCallback((note) => {
        if (!pianoEngine || !samplesLoaded) return;

        console.log('🎵 Stopping note:', note);
        setActiveNotes(prev => {
            const updated = { ...prev };
            delete updated[note];
            return updated;
        });
        pianoEngine.stopNote(note);
    }, [pianoEngine, samplesLoaded]);

    // Toggle sheet music panel collapse state
    const toggleSheetMusicCollapse = () => {
        setIsSheetMusicCollapsed(!isSheetMusicCollapsed);
    };

    // Manual retry function
    const retryInitialization = () => {
        console.log('🔄 Retrying piano initialization...');
        setIsLoading(true);
        setLoadingStatus('Retrying...');
        initializationRef.current = false;
        startAudio();
    };

    return (
        <div className={`App ${theme === 'dark' ? 'dark-theme' : ''}`} ref={appContainerRef}>
            <header className="App-header">
                <h1>Piano Simulator</h1>
                <div className="app-controls">
                    <button
                        className="app-control-button"
                        onClick={() => setIsHelpOpen(true)}
                        title="Help"
                    >
                        ?
                    </button>
                    <button
                        className="app-control-button"
                        onClick={() => setIsSettingsOpen(true)}
                        title="Settings"
                    >
                        ⚙️
                    </button>
                </div>
            </header>
            <main>
                {/* Sheet Music Container */}
                <div className="sheet-music-container" style={{
                    minHeight: '350px',
                    height: '350px',
                    flexShrink: 0,
                    width: '100%'
                }}>
                    <SheetMusicViewer
                        isCollapsed={isSheetMusicCollapsed}
                        toggleCollapse={toggleSheetMusicCollapse}
                    />
                </div>

                {/* Piano Container */}
                <div className="piano-container">
                    {isLoading ? (
                        <div className="loading-status">
                            <div>{loadingStatus}</div>
                            {!audioStarted && (
                                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                                    👆 Click anywhere to start
                                </div>
                            )}
                            {loadingStatus.includes('Error') && (
                                <button
                                    onClick={retryInitialization}
                                    style={{
                                        marginTop: '15px',
                                        padding: '8px 16px',
                                        backgroundColor: '#4CAF50',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Retry
                                </button>
                            )}
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

                {/* Controls Container */}
                <div className="controls-container">
                    <RecordingControls
                        disabled={isLoading || !samplesLoaded}
                    />
                </div>

                {/* Visualization Container */}
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
import React, { useState, useEffect, useRef } from 'react';
import './RecordingControl.css';
import AudioRecorder from '../audio/AudioRecorder';
import * as Tone from 'tone';

const RecordingControls = ({ disabled }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [recordingInterval, setRecordingInterval] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [audioInitialized, setAudioInitialized] = useState(false);

    // Reference to our recorder
    const recorderRef = useRef(null);
    // Reference to audio element for testing playback
    const audioRef = useRef(null);

    // Initialize the recorder when the component mounts
    useEffect(() => {
        const initializeRecorder = async () => {
            try {
                // Make sure Tone.js is started
                await Tone.start();

                const recorder = new AudioRecorder();
                await recorder.initialize();
                recorderRef.current = recorder;
                setAudioInitialized(true);
                console.log('AudioRecorder component initialized');
            } catch (error) {
                console.error('Failed to initialize AudioRecorder component:', error);
            }
        };

        // Only initialize if Tone.js context is running
        if (Tone.context.state === 'running') {
            initializeRecorder();
        } else {
            // Add a click handler to initialize audio context
            const handleClick = async () => {
                await Tone.start();
                initializeRecorder();
                document.removeEventListener('click', handleClick);
            };
            document.addEventListener('click', handleClick);
        }

        // Clean up on component unmount
        return () => {
            if (recordingInterval) {
                clearInterval(recordingInterval);
            }

            if (recorderRef.current) {
                recorderRef.current.dispose();
            }

            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, []);

    const startRecording = async () => {
        if (disabled || !recorderRef.current || !audioInitialized) {
            console.warn('Recording disabled or not initialized');
            return;
        }

        // Clean up previous recording if exists
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
        setAudioBlob(null);

        // Reset recording state
        setIsRecording(true);
        setRecordingTime(0);

        // Set up recording completion callback
        const onRecordingComplete = (blob) => {
            console.log('Recording complete, blob size:', blob.size);
            setAudioBlob(blob);

            // Create an audio URL for testing playback
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
        };

        // Start recording
        console.log('Starting recording with initialized recorder');
        const success = await recorderRef.current.startRecording(onRecordingComplete);

        if (success) {
            console.log('Recording started successfully');
            // Start a timer to track recording duration
            const interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            setRecordingInterval(interval);
        } else {
            console.error('Failed to start recording');
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (!isRecording || !recorderRef.current) {
            console.warn('No recording to stop');
            return;
        }

        console.log('Stopping recording');
        // Clear the recording timer
        if (recordingInterval) {
            clearInterval(recordingInterval);
            setRecordingInterval(null);
        }

        // Stop recording
        recorderRef.current.stopRecording();
        setIsRecording(false);
    };

    const saveRecording = () => {
        if (!audioBlob) {
            console.warn('No recording to save');
            return;
        }

        console.log('Saving recording, blob type:', audioBlob.type);
        // Create a download link for the audio blob
        const url = URL.createObjectURL(audioBlob);
        const filename = `piano-recording-${new Date().toISOString().replace(/:/g, '-')}.webm`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        // Clean up the URL object (but keep our audioUrl for playback)
        URL.revokeObjectURL(url);
    };

    // Format the recording time as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="recording-controls">
            {isRecording && (
                <div className="recording-status">
                    <div className="recording-indicator"></div>
                    <span className="recording-time">{formatTime(recordingTime)}</span>
                </div>
            )}

            <div className="control-buttons">
                {!isRecording ? (
                    <button
                        className="control-button record-button"
                        onClick={startRecording}
                        disabled={disabled || !audioInitialized}
                    >
                        Record
                    </button>
                ) : (
                    <button
                        className="control-button stop-button"
                        onClick={stopRecording}
                    >
                        Stop
                    </button>
                )}

                <button
                    className="control-button save-button"
                    onClick={saveRecording}
                    disabled={!audioBlob}
                >
                    Save
                </button>
            </div>

            {audioBlob && !isRecording && (
                <div className="recording-ready">
                    Recording ready! <button className="test-playback-button" onClick={() => audioRef.current?.play()}>Test Playback</button>
                    <span className="recording-note">(WebM Audio)</span>
                </div>
            )}

            {/* Hidden audio element for testing playback */}
            {audioUrl && (
                <audio ref={audioRef} src={audioUrl} controls style={{ display: 'none' }} />
            )}
        </div>
    );
};

export default RecordingControls;
import * as Tone from 'tone';

class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.onRecordingComplete = null;

        // We'll use Tone's built-in context instead of creating our own
        this.toneContext = Tone.getContext().rawContext;
        this.destinationNode = null;
    }

    async initialize() {
        try {
            console.log('AudioRecorder initialized with Tone context:', this.toneContext);
            return true;
        } catch (error) {
            console.error('Failed to initialize AudioRecorder:', error);
            return false;
        }
    }

    async startRecording(onComplete) {
        if (this.isRecording) {
            console.warn('Recording already in progress');
            return false;
        }

        try {
            this.onRecordingComplete = onComplete;
            this.audioChunks = [];

            // Create a destination node for our recording directly in the Tone.js context
            this.destinationNode = this.toneContext.createMediaStreamDestination();

            // Create a recording stream from Tone.js master output
            // The key is to tap directly into Tone's master output
            const recorder = this.toneContext.createGain();
            recorder.gain.value = 1.0;

            // Get Tone's master output and connect it to our recorder
            // This is critical - we need to get the actual audio signal from Tone
            const toneMaster = Tone.getDestination().input;
            toneMaster.connect(recorder);
            recorder.connect(this.destinationNode);

            console.log('Connected Tone master to recorder');

            // Create a media recorder with the stream from our destination node
            const stream = this.destinationNode.stream;

            // Create media recorder from the stream
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            // Set up event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                // Create a blob from the recorded chunks
                const audioBlob = new Blob(this.audioChunks, {
                    type: 'audio/webm'
                });

                console.log('Recording completed, blob size:', audioBlob.size);

                // Disconnect our recorder from Tone
                recorder.disconnect();
                toneMaster.disconnect(recorder);

                // Call the completion callback
                if (this.onRecordingComplete) {
                    this.onRecordingComplete(audioBlob);
                }

                this.isRecording = false;
            };

            // Start recording with 100ms timeslice to get data more frequently
            this.mediaRecorder.start(100);
            this.isRecording = true;
            console.log('Recording started');

            return true;
        } catch (error) {
            console.error('Error starting recording:', error);
            this.isRecording = false;
            return false;
        }
    }

    stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            console.warn('No recording in progress');
            return false;
        }

        try {
            this.mediaRecorder.stop();
            console.log('Recording stopped');
            return true;
        } catch (error) {
            console.error('Error stopping recording:', error);
            return false;
        }
    }

    // Clean up resources
    dispose() {
        if (this.isRecording) {
            this.stopRecording();
        }

        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.onRecordingComplete = null;
    }
}

export default AudioRecorder;
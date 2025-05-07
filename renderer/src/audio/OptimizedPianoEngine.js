import * as Tone from 'tone';

class OptimizedPianoEngine {
    constructor() {
        this.sampler = null;
        this.isLoaded = false;
        this.reverb = null;
        this.activeNotes = new Set();

        // Settings
        this.settings = {
            volume: 0.75,
            reverbWet: 0.2,
            reverbDecay: 2.5,
            release: 1,
            pedalRelease: 4
        };

        // Current state
        this.isSustainOn = false;
    }

    async setupAudio() {
        // Create reverb effect for piano acoustics - keep this simple like in PianoEngine
        this.reverb = new Tone.Reverb({
            decay: this.settings.reverbDecay,
            wet: this.settings.reverbWet
        }).toDestination();

        // Generate reverb impulse response
        await this.reverb.generate();
        console.log('Audio chain setup complete');
        return true;
    }

    async loadSamples(sampleMapping) {
        try {
            // Create a piano sampler with the provided sample mapping
            // Use the same approach as in the original PianoEngine
            this.sampler = new Tone.Sampler({
                urls: sampleMapping,
                release: this.settings.release,
                baseUrl: '/samples/',
                onload: () => {
                    console.log('Piano samples loaded successfully');
                    this.isLoaded = true;
                    // Connect the sampler to the reverb effect
                    this.sampler.connect(this.reverb);
                }
            }).toDestination();

            // Add error handling
            this.sampler.onerror = (error) => {
                console.error('Sampler error:', error);
            };

            return true;
        } catch (error) {
            console.error('Error loading piano samples:', error);
            throw error;
        }
    }

    // Update engine settings
    updateSettings(newSettings) {
        // Update our stored settings
        this.settings = { ...this.settings, ...newSettings };

        // Apply settings to components
        if (this.reverb) {
            this.reverb.wet.value = this.settings.reverbWet;
        }

        if (this.sampler) {
            // Apply volume directly to the sampler
            this.sampler.volume.value = Math.log10(this.settings.volume) * 20; // Convert to dB

            // Update release time but respect sustain pedal state
            this.sampler.release = this.isSustainOn ?
                this.settings.pedalRelease : this.settings.release;
        }

        return this.settings;
    }

    playNote(note, velocity = 0.75) {
        if (!this.isLoaded || !this.sampler) {
            console.warn('Piano samples not loaded yet');
            return;
        }

        try {
            // Track active notes
            this.activeNotes.add(note);

            // Use velocity sensitive playback
            this.sampler.triggerAttack(note, Tone.now(), velocity);
        } catch (error) {
            console.error('Error playing note:', note, error);
        }
    }

    stopNote(note) {
        if (!this.isLoaded || !this.sampler) return;

        try {
            // Remove from active notes
            this.activeNotes.delete(note);

            // Release the note
            this.sampler.triggerRelease(note, Tone.now());
        } catch (error) {
            console.error('Error stopping note:', note, error);
        }
    }

    // Method to handle sustain pedal
    setSustain(isOn) {
        if (!this.isLoaded || !this.sampler) return;

        this.isSustainOn = isOn;
        this.sampler.release = isOn ? this.settings.pedalRelease : this.settings.release;
    }

    // Stop all currently playing notes
    stopAllNotes() {
        if (!this.isLoaded || !this.sampler) return;

        try {
            // Release all active notes
            this.sampler.releaseAll(Tone.now());
            this.activeNotes.clear();
        } catch (error) {
            console.error('Error stopping all notes:', error);
        }
    }

    // Clean up resources when done
    dispose() {
        if (this.sampler) {
            this.sampler.dispose();
            this.sampler = null;
        }

        if (this.reverb) {
            this.reverb.dispose();
            this.reverb = null;
        }

        this.isLoaded = false;
        this.activeNotes.clear();
    }
}

export default OptimizedPianoEngine;
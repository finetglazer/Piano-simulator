import * as Tone from 'tone';

class OptimizedPianoEngine {
    constructor() {
        this.sampler = null;
        this.isLoaded = false;
        this.reverb = null;
        this.activeNotes = new Set();

        // Add a volume control node
        this.volumeNode = new Tone.Volume(0).toDestination();

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
        // Create reverb effect for piano acoustics
        this.reverb = new Tone.Reverb({
            decay: this.settings.reverbDecay,
            wet: this.settings.reverbWet
        });

        // Connect reverb to volume node instead of destination
        this.reverb.connect(this.volumeNode);

        // Set initial volume based on settings
        this.volumeNode.volume.value = this._convertToDecibels(this.settings.volume);

        // Generate reverb impulse response
        await this.reverb.generate();
        console.log('Audio chain setup complete with volume control');
        return true;
    }

    // Helper method to convert 0-1 range to decibels with safety checks
    _convertToDecibels(volumeLevel) {
        // Ensure volume is in valid range
        const safeVolume = Math.max(0.001, Math.min(1, volumeLevel));
        // Convert to decibels with a more gradual curve
        return 20 * Math.log10(safeVolume);
    }

    async loadSamples(sampleMapping) {
        try {
            // Create a piano sampler with the provided sample mapping
            this.sampler = new Tone.Sampler({
                urls: sampleMapping,
                release: this.settings.release,
                baseUrl: '/samples/',
                onload: () => {
                    console.log('Piano samples loaded successfully');
                    this.isLoaded = true;

                    // Connect the sampler to the reverb (not directly to destination)
                    this.sampler.connect(this.reverb);

                    // Apply initial volume setting
                    this.updateSettings({
                        volume: this.settings.volume
                    });

                    console.log('Volume set to', this.settings.volume, 'dB:', this._convertToDecibels(this.settings.volume));
                }
            });

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

        // Apply volume to the volume node (more reliable than setting on sampler)
        if (this.volumeNode) {
            const volumeInDb = this._convertToDecibels(this.settings.volume);
            this.volumeNode.volume.value = volumeInDb;
            console.log('Volume updated to', this.settings.volume, 'dB:', volumeInDb);
        }

        if (this.sampler) {
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

        if (this.volumeNode) {
            this.volumeNode.dispose();
            this.volumeNode = null;
        }

        this.isLoaded = false;
        this.activeNotes.clear();
    }
}

export default OptimizedPianoEngine;
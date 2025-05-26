import * as Tone from 'tone';

class OptimizedPianoEngine {
    constructor() {
        this.sampler = null;
        this.isLoaded = false;
        this.reverb = null;
        this.activeNotes = new Set();

        // Add a volume control node with higher initial gain
        this.volumeNode = new Tone.Volume(6).toDestination(); // Start at +6dB instead of 0dB

        // Settings with enhanced volume range
        this.settings = {
            volume: 0.75, // This will now map to higher dB values
            reverbWet: 0.2,
            reverbDecay: 2.5,
            release: 1,
            pedalRelease: 4,
            // New settings for better volume control
            maxVolumeDb: 12, // Allow up to +12dB amplification
            minVolumeDb: -40 // Minimum volume in dB
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
        console.log('Audio chain setup complete with enhanced volume control');
        return true;
    }

    // Enhanced volume conversion with amplification capability
    _convertToDecibels(volumeLevel) {
        // Ensure volume is in valid range
        const safeVolume = Math.max(0.001, Math.min(1.5, volumeLevel)); // Allow 150% for amplification

        // Enhanced volume curve with amplification
        // Maps 0-1 range to minVolumeDb to maxVolumeDb range
        const { minVolumeDb, maxVolumeDb } = this.settings;

        if (safeVolume <= 0.001) {
            return minVolumeDb;
        }

        // Use exponential curve for more natural volume progression
        // 0.5 (50%) maps to roughly 0dB, 1.0 (100%) maps to maxVolumeDb
        const normalizedVolume = Math.pow(safeVolume, 0.5); // Square root for more gradual curve
        const dbValue = minVolumeDb + (normalizedVolume * (maxVolumeDb - minVolumeDb));

        console.log(`Volume ${(volumeLevel * 100).toFixed(0)}% -> ${dbValue.toFixed(1)}dB`);
        return Math.max(Math.min(dbValue, maxVolumeDb), minVolumeDb);
    }

    // Alternative linear mapping method (you can choose which one to use)
    _convertToDecibelsPowerCurve(volumeLevel) {
        const safeVolume = Math.max(0.001, Math.min(1.2, volumeLevel));

        // Power curve mapping:
        // 0% -> -40dB, 50% -> 0dB, 100% -> +12dB, 120% -> +15dB
        if (safeVolume <= 0.001) return -40;
        if (safeVolume <= 0.5) {
            // 0 to 50%: -40dB to 0dB
            return -40 + (safeVolume * 2 * 40);
        } else {
            // 50% to 120%: 0dB to +15dB
            return ((safeVolume - 0.5) / 0.7) * 15;
        }
    }

    async loadSamples(sampleMapping) {
        try {
            // Create a piano sampler with the provided sample mapping
            this.sampler = new Tone.Sampler({
                urls: sampleMapping,
                release: this.settings.release,
                baseUrl: '/samples/',
                // Add volume boost to the sampler itself
                volume: 3, // +3dB boost at sampler level
                onload: () => {
                    console.log('Piano samples loaded successfully with volume boost');
                    this.isLoaded = true;

                    // Connect the sampler to the reverb (not directly to destination)
                    this.sampler.connect(this.reverb);

                    // Apply initial volume setting
                    this.updateSettings({
                        volume: this.settings.volume
                    });

                    console.log('Enhanced volume system initialized');
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

    // Update engine settings with enhanced volume handling
    updateSettings(newSettings) {
        // Update our stored settings
        this.settings = { ...this.settings, ...newSettings };

        // Apply settings to components
        if (this.reverb) {
            this.reverb.wet.value = this.settings.reverbWet;
        }

        // Apply enhanced volume to the volume node
        if (this.volumeNode) {
            const volumeInDb = this._convertToDecibels(this.settings.volume);
            this.volumeNode.volume.value = volumeInDb;
            console.log('Enhanced volume updated to', (this.settings.volume * 100).toFixed(0) + '%', 'dB:', volumeInDb.toFixed(1));
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

            // Enhanced velocity handling - boost velocity for louder notes
            const enhancedVelocity = Math.min(velocity * 1.2, 1.0); // 20% velocity boost
            this.sampler.triggerAttack(note, Tone.now(), enhancedVelocity);
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

    // Method to temporarily boost volume for testing
    setTemporaryVolumeBoost(boost = 6) {
        if (this.volumeNode) {
            const currentDb = this._convertToDecibels(this.settings.volume);
            this.volumeNode.volume.value = currentDb + boost;
            console.log(`Temporary volume boost: +${boost}dB`);
        }
    }

    // Method to get current volume in dB for debugging
    getCurrentVolumeDb() {
        return this.volumeNode ? this.volumeNode.volume.value : null;
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
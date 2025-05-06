import * as Tone from 'tone';

class OptimizedPianoEngine {
    constructor() {
        this.sampler = null;
        this.isLoaded = false;
        this.reverb = null;
        this.limiter = null;
        this.masterVolume = null;
        this.activeNotes = new Set();
        this.loadingPromise = null;

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
        // Create a master volume control
        this.masterVolume = new Tone.Volume(Math.log10(this.settings.volume) * 20); // Convert to dB

        // Create a limiter to prevent clipping
        this.limiter = new Tone.Limiter(-3).connect(Tone.getDestination());

        // Connect master volume to limiter
        this.masterVolume.connect(this.limiter);

        // Create reverb effect for piano acoustics
        this.reverb = new Tone.Reverb({
            decay: this.settings.reverbDecay,
            wet: this.settings.reverbWet
        });

        // Connect reverb to master volume
        this.reverb.connect(this.masterVolume);

        // Generate reverb impulse response
        this.loadingPromise = this.reverb.generate();
        await this.loadingPromise;

        console.log('Audio chain setup complete');
        return true;
    }

    async loadSamples(sampleMapping) {
        if (!this.reverb) {
            await this.setupAudio();
        }

        try {
            // Wait for reverb to be fully generated if needed
            if (this.loadingPromise) {
                await this.loadingPromise;
                this.loadingPromise = null;
            }

            // Create a piano sampler with the provided sample mapping
            this.sampler = new Tone.Sampler({
                urls: sampleMapping,
                release: this.settings.release,
                baseUrl: '/samples/',
                onload: () => {
                    console.log('Piano samples loaded successfully');
                    this.isLoaded = true;

                    // Optimize the sampler's performance
                    if (this.sampler.context) {
                        // Set a reasonable buffer size for better performance
                        const bufferSize = 1024;
                        if (this.sampler.context.audioWorklet) {
                            // Modern audio worklets for better performance if available
                            this.sampler.context.audioWorklet.addProcessor('optimized-processor', bufferSize);
                        }
                    }
                }
            }).connect(this.reverb);

            // Add error handling
            this.sampler.onerror = (error) => {
                console.error('Sampler error:', error);
            };

            // Return a promise that resolves when samples are loaded
            return new Promise((resolve, reject) => {
                if (this.isLoaded) {
                    resolve(true);
                } else {
                    // Set a timeout for loading samples
                    const loadTimeout = setTimeout(() => {
                        if (!this.isLoaded) {
                            reject(new Error('Timed out loading piano samples'));
                        }
                    }, 30000); // 30 second timeout

                    // Success handler
                    this.sampler.onstop = () => {
                        clearTimeout(loadTimeout);
                        this.isLoaded = true;
                        resolve(true);
                    };
                }
            });
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
        if (this.masterVolume) {
            this.masterVolume.volume.value = Math.log10(this.settings.volume) * 20;
        }

        if (this.reverb) {
            this.reverb.wet.value = this.settings.reverbWet;

            // Only regenerate reverb if decay has changed significantly
            if (Math.abs(this.reverb.decay - this.settings.reverbDecay) > 0.5) {
                this.reverb.decay = this.settings.reverbDecay;
                this.reverb.generate();
            }
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

        // If turning sustain off, release all inactive notes immediately
        if (!isOn) {
            // Immediate release of all notes (handled by Tone.js)
        }
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

        if (this.limiter) {
            this.limiter.dispose();
            this.limiter = null;
        }

        if (this.masterVolume) {
            this.masterVolume.dispose();
            this.masterVolume = null;
        }

        this.isLoaded = false;
        this.activeNotes.clear();
    }
}

export default OptimizedPianoEngine;
import * as Tone from 'tone';

class PianoEngine {
    constructor() {
        this.sampler = null;
        this.isLoaded = false;
        this.reverb = null;
        this.setupAudio();
    }

    async setupAudio() {
        // Create reverb effect for piano acoustics
        this.reverb = new Tone.Reverb({
            decay: 2.5,
            wet: 0.2
        }).toDestination();

        await this.reverb.generate();
        console.log('Reverb generated');
    }

    async loadSamples(sampleMapping) {
        try {
            // Create a piano sampler with the provided sample mapping
            this.sampler = new Tone.Sampler({
                urls: sampleMapping,
                release: 1,
                baseUrl: '/samples/', // Fix: Use absolute path with leading slash
                onload: () => {
                    console.log('Piano samples loaded successfully');
                    this.isLoaded = true;
                    // Connect the sampler to the reverb effect
                    this.sampler.connect(this.reverb);
                }
            }).toDestination();

            // Add an additional error event listener
            this.sampler.onerror = (error) => {
                console.error('Sampler error:', error);
            };
        } catch (error) {
            console.error('Error loading piano samples:', error);
        }
    }

    playNote(note, velocity = 0.75) {
        if (!this.isLoaded || !this.sampler) {
            console.warn('Piano samples not loaded yet');
            return;
        }

        try {
            // Convert velocity (0-1) to volume in decibels (this line wasn't being used)
            // const velocityInDb = Tone.gainToDb(velocity);
            this.sampler.triggerAttack(note, Tone.now(), velocity);
        } catch (error) {
            console.error('Error playing note:', note, error);
        }
    }

    stopNote(note) {
        if (!this.isLoaded || !this.sampler) return;
        try {
            this.sampler.triggerRelease(note, Tone.now());
        } catch (error) {
            console.error('Error stopping note:', note, error);
        }
    }

    // Method to handle sustain pedal
    setSustain(isOn) {
        if (!this.isLoaded || !this.sampler) return;
        this.sampler.release = isOn ? 4 : 1; // Longer release time when sustain is on
    }
}

export default PianoEngine;
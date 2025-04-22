# Piano Samples Organization

This directory contains the piano samples used by the Piano Simulator.

## Sample Source
The samples are from the Salamander Grand Piano, a free, high-quality sampled grand piano.
Source: https://freepats.zenvoid.org/Piano/acoustic-grand-piano.html

## Organization Structure
The sample files should be named according to the note they represent.
Example: `C4.mp3` for middle C, `A4.mp3` for A440, etc.

## Sample Format
- File format: MP3
- Sample rate: 44.1kHz
- Bit depth: 16-bit

## Velocity Layers
For the initial setup, we're using a single velocity layer per note.
In a more advanced setup, you might have multiple samples per note for different velocities:
- `C4_vl1.mp3` (soft)
- `C4_vl2.mp3` (medium)
- `C4_vl3.mp3` (loud)

## Sample Coverage
For a complete piano, you'll need samples for all 88 keys (A0 to C8).
For testing purposes, you can start with a subset of samples as defined in PianoSampleLoader.js.
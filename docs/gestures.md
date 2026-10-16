# Neo Theremin gestures

What each hand gesture does, and the tech stack. The short version is the [README](../README.md).

## Gestures

Each hand controls an independent synth voice. Move in front of the camera to play, change pitch and volume, switch scales, or add effects. Neo Theremin includes 21 synth packs, five musical scales, note snapping, reverb, and an in-app gesture guide.

| Input | Effect |
|-------|--------|
| **Thumb-Index distance** | Pitch (close = high, spread = low) |
| **Hand height** | Volume (high = loud, low = quiet) |
| **Open hand** | Play |
| **Horns (index + pinky up)** | Sustain (holds volume, pitch still changes) |
| **Fist** | Mute |
| **Point (index only)** | Vibrato |
| **Peace (index + middle)** | Filter sweep |
| **Open mouth** | Siren effect |

The on-screen HUD shows tracked hands, gesture labels, pitch, and volume. Opening your mouth triggers a rising siren tone.

## Tech stack

- **React** + **Vite**
- **Tailwind CSS v4**
- **MediaPipe Tasks Vision:** HandLandmarker for two hands and FaceLandmarker for mouth detection
- **Web Audio API:** dual oscillators, filters, convolution reverb, and wave shaping

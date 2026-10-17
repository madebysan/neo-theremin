<p><img src="assets/app-icon.png" width="128" height="128" alt="Neo Theremin app icon"></p>

<h1>Neo Theremin</h1>

<p>Play a browser-based synthesizer with your hands.<br>
Your webcam tracks each hand and turns movement into sound.</p>

<p>
  <img src="https://img.shields.io/badge/React-61dafb" alt="React">
  <img src="https://img.shields.io/badge/Vite-646cff" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-38bdf8" alt="Tailwind">
</p>

<p><a href="https://neo-theremin.vercel.app">Try it live</a></p>

![Neo Theremin tracking two hands over the webcam image](public/theremin.gif)

Neo Theremin turns your webcam into an instrument you play in the air.

- Each hand plays its own voice: the gap between thumb and index sets pitch, height sets volume.
- Gestures add sustain, vibrato, filter sweeps and mute; opening your mouth sounds a siren.
- 21 synth packs, five scales and note snapping.

## How it works

Hand and face tracking run in the browser with [MediaPipe](https://ai.google.dev/edge/mediapipe), and the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) makes the sound. The video isn't uploaded; the tracking models download from Google's servers when the page loads. The full gesture list is in [docs/gestures.md](docs/gestures.md).

## Install

Use it at [neo-theremin.vercel.app](https://neo-theremin.vercel.app), or run it locally with `npm install --legacy-peer-deps` and `npm run dev`. It needs a webcam; Chrome and Edge give the tracking the most reliable GPU path.

---

[MIT](LICENSE)

Made by [santiagoalonso.com](https://santiagoalonso.com)

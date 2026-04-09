# Live Audio Visualizer

This project has been refreshed so it runs cleanly in a modern browser setup (2026-ready) while preserving the original shader style.

## What was updated

- Reworked the app to a pure browser ES module entrypoint.
- Updated Three.js usage to modern module imports (`three@0.180.0` via CDN).
- Removed the old mixed CommonJS/ESM code path that prevented direct browser execution.
- Kept microphone-driven Web Audio reactivity and shader-based column animation.
- Added simple local run scripts (`npm run dev` / `npm start`) using Python's built-in server.

## Run locally

```bash
npm run dev
```

Then open:

- `http://localhost:4173`

Allow microphone access when prompted.

## Notes

- The app loads Three.js modules from jsDelivr.
- Shaders are loaded from `sketches/shader/*.glsl` at runtime.

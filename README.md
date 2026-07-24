# CodeFlow Web App

Interactive browser UI for `code_visualizer`.

## Structure

- `src/` React UI
- `public/pyodide/` browser runtime assets
- `scripts/sync_python_runtime.py` registers prebuilt browser wheels into `runtime-config.json`

## Commands

```bash
npm install
# download upstream wheels first, then place them under public/pyodide/wheels
python3 scripts/sync_python_runtime.py
npm run dev
```

## Notes

- Browser mode is the default execution path.
- The app consumes the public manifest API from `codeflow-py`.
- Browser Python dependencies are loaded from wheels under `public/pyodide/wheels/`.
- This repo does not build Python artifacts; it only consumes prebuilt wheels.
- `step-tracer` and `query-engine` browser wheels should come from their upstream GitHub workflow artifacts or release assets.

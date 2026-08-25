# CodeFlow Web App

Interactive browser UI for `code_visualizer`.

## Structure

- `src/` React UI
- `public/pyodide/` browser runtime assets
- `public/pyodide/runtime-wheel-sources.json` defines the default upstream wheel URLs
- `scripts/sync_python_runtime.py` copies those wheel URLs into `runtime-config.json`

## Commands

```bash
npm install
python3 scripts/sync_python_runtime.py
npm run dev
```

## Notes

- Browser mode is the default execution path.
- The app consumes the public manifest API from `codeflow-py`.
- Browser Python dependencies are loaded from upstream wheel URLs registered in `runtime-config.json`.
- This repo does not build Python artifacts; it only consumes prebuilt wheels.
- The default browser wheel sources live in `public/pyodide/runtime-wheel-sources.json`.
- `codeflow-py` wheel URLs must use valid Python wheel filenames, for example `codeflow_py-0.1.0-py3-none-any.whl`.
- `step-tracer` and `query-engine` should be consumed from their upstream GitHub release assets.

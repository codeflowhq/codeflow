# CodeFlow Web App

Interactive browser UI for `code_visualizer`.

## Structure

- `src/` React UI
- `public/pyodide/` browser runtime assets
- `scripts/sync_python_runtime.py` rebuilds the Pyodide runtime bundle
- `scripts/browser_dependency_lock.json` pins browser-side Python dependency builds to immutable upstream refs

## Commands

```bash
npm install
python3 scripts/sync_python_runtime.py
npm run dev
```

## Notes

- Browser mode is the default execution path.
- The app consumes the public manifest API from `codeflow-py`.
- Local wheel install is used for `codeflow-py`; vendored sources are only for browser-only dependencies.

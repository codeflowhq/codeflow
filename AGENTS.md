# AGENTS.md

# AI Instructions

This web app is the browser UI for CodeFlow. It is a React + Vite application
with a Pyodide runtime boundary and a visualization-heavy UI.

The next phase of work should optimize for:

- maintainability,
- explicit state ownership,
- testable pure logic,
- clean JS↔Python boundaries,
- predictable rendering behavior.

Do not optimize only for "working in the browser". Optimize for code quality and
long-term changeability.

---

# Core Engineering Principles

- Keep state local unless it is genuinely shared.
- If state is shared across many components, move it behind a context or store.
- Avoid prop-drilling large state surfaces through page components.
- Prefer pure utilities and deterministic hooks.
- UI components should render; orchestration should live elsewhere.
- Normalize data once at the boundary, then trust the normalized shape.
- Do not silently swallow runtime errors.
- Avoid duplication in timeline logic, manifest normalization, and watch parsing.

---

# Target Frontend Architecture

The current review identifies three main pressure points:

1. `App.jsx` owns too much state
2. hook APIs are too wide
3. runtime / manifest / timeline logic is duplicated across modules

The target structure should move toward:

    src/
      app/
        providers/
        routes/
        layout/

      features/
        visualization/
          components/
          hooks/
          state/
          lib/

        library/
          components/
          hooks/
          state/

        runtime/
          components/
          hooks/
          state/

      shared/
        ui/
        lib/
        errors/
        types/

This does not need to be achieved in one jump, but every change should move the
codebase closer to that shape rather than further from it.

---

# State Management Rules

- Do not add more top-level state to `App.jsx` unless it is truly app-global.
- If a component receives a long prop list, treat that as a smell.
- Hooks should expose focused APIs. If a hook returns too many fields, split it.
- Timeline state, watch-list state, and runtime state are separate concerns.
- Prefer a provider/store boundary over relaying many callbacks through multiple
  component layers.

If introducing a store:

- prefer something lightweight and well-supported,
- keep stores domain-specific,
- keep derived selectors close to the store,
- keep imperative UI actions out of presentation components.

---

# JS / Python Boundary Rules

- The browser consumes normalized manifest payloads, not internal Python models.
- Snake case belongs on the Python side; camelCase belongs on the JS side.
- Normalize once in the runtime boundary and do not mix both conventions deeper
  in React components.
- Python bootstrap code should not live as a large JS string array if it can be
  represented as a real `.py` asset or raw-imported file.

---

# Naming & Module Rules

- Avoid generic files like `utils.js`, `helpers.js`, `misc.js`, `common.js`.
- Prefer domain-specific names:
  - `timeline/buildTimelineFrames.js`
  - `runtime/normalizeManifest.js`
  - `watch/parseExpressions.js`
- Keep related components, hooks, and pure utilities near each other.
- One file should own one main concern.

---

# Component Rules

- Page components should compose feature components; they should not implement
  feature logic inline.
- Presentation components should not contain duplicated timeline or runtime
  logic.
- If the same key computation or normalization rule appears in more than one
  file, extract it.
- Avoid putting business logic inside JSX-heavy files where possible.

---

# Runtime & Error Handling

- Runtime initialization failures must surface in visible UI state.
- Do not rely on `console.error` as user-facing error handling.
- Centralize runtime error normalization.
- Error display should have one clear owner to avoid duplicate modals or toast
  races.
- Mutable module-level singletons should be minimized and wrapped behind a clear
  lifecycle API where possible.
- Do not ship debug globals or unconditional `console.log` calls in production
  code.
- If a browser runtime or asset bootstrap boundary exists, keep it behind one
  lifecycle API rather than spreading initialization across components.

---

# Styling Rules

- Prefer scoped styles or clear feature-local styling boundaries.
- Avoid broad `!important` overrides against Ant Design internals.
- Prefer Ant Design theming/tokens over brittle CSS overrides.
- Keep visualization-specific styles near the feature when possible.
- Treat repeated timing values and layout numbers as named constants, not inline
  literals.

---

# Type Safety

- This codebase is currently JavaScript, but all new logic should be written so
  that a TypeScript migration is straightforward.
- Use JSDoc typedefs where they materially improve boundary clarity.
- Shared payload shapes, config objects, and manifest entries should have one
  source of truth.
- Avoid passing loosely structured objects around without documentation.

---

# Testing

- Pure logic must be tested before UI behavior.
- Prioritize tests for:
  - manifest normalization,
  - timeline construction,
  - watch expression parsing,
  - runtime error normalization,
  - config payload generation.
- Tests should mirror source structure as the app is reorganized.

Example direction:

    src/runtime/manifestNormalizer.js
    src/lib/timeline.js
    src/lib/watchExpressions.js

    tests/runtime/test_manifestNormalizer.js
    tests/lib/test_timeline.js
    tests/lib/test_watchExpressions.js

- Add tests whenever logic is extracted out of components.

---

# Accessibility

- Interactive UI must remain keyboard-operable.
- Avoid click-only interactions without a keyboard path.
- Non-button clickable UI should be reviewed for semantics and focusability.
- Transport controls and watch interactions should have explicit accessible
  labels.

---

# Immediate Review-Driven Priorities

The attached web review indicates the next changes should focus on:

1. reducing `App.jsx` orchestration load,
2. splitting oversized hooks,
3. centralizing timeline key computation,
4. improving runtime error ownership,
5. tightening the JS↔Python boundary,
6. growing test coverage for pure utilities.

When making web changes, prefer those directions unless a more urgent bug forces
otherwise.

---

# Persistent Follow-up From Review

The following items remain open or only partially addressed and should influence
future changes:

- Prefer real `.py` assets or raw imports for Python bootstrap code; do not
  regress to JS string-encoded Python.
- Normalize manifest payloads once at the JS/Python boundary and then use
  camelCase consistently inside the frontend.
- Add tests whenever pure config, navigation, timeline, or manifest logic is
  extracted.
- Critical user interaction paths (watch selection, playback controls, render
  fallback surfaces) should have component-level tests in addition to pure
  utility tests.
- Prefer `transitionend`-style cleanup over hardcoded `setTimeout` cleanup in
  animation code when practical.
- CI should run the equivalent of `npm run verify` before deploy logic is
  considered complete.
- Browser dependency build scripts must pin external repos to exact immutable
  refs. Do not fetch `main`, `HEAD`, or floating raw URLs in checked-in
  tooling.
- Heavy visualization dependencies should stay behind lazy-load boundaries.
  If a dependency still dominates build size after isolation, treat that as an
  architectural choice to justify explicitly rather than an invisible default.
- App-shell actions such as library navigation, save, and share belong in the
  global header or page shell, not inside the editor card.
- Keep the top header for top-level navigation only. Secondary visualization
  actions such as run, save, and share should live in the visualization shell
  itself (for example the fixed sidebar), not beside app-level tabs.
- Runtime status and picking-mode status belong near the active workspace
  surface (editor/visualization area), not buried in the navigation sidebar.
- Variable watch configuration should stay in a central modal workflow that lets
  the user switch between watched variables without leaving the dialog.
- Variable-picking UI should separate selection from action. Avoid repeating the
  same add/configure controls in multiple places when one focused detail panel
  can own the next step.
- Execution step limits must be applied at the tracing/runtime boundary first.
  Do not rely only on post-render trimming when a limit is meant to change the
  run itself.
- Keep the header compact. Use it for brand and top-level destinations only; do
  not turn it into a second toolbar.
- App shell code belongs under `src/app/`. Do not leave page routing or shell
  orchestration in root-level files once a dedicated shell exists.
- Feature entry pages belong inside their feature directories rather than under
  `src/components/`.
- Feature-local panels, tests, and hooks belong inside their feature
  directories. Do not keep editor/watch/visualization internals under
  root-level `src/components/` or `src/hooks/` once a feature boundary is
  established.
- Workspace-level context, provider, and state composition belong under
  `features/workspace/`, not under a narrower feature such as
  `features/visualization/`.
- Python/Pyodide browser boundary code belongs under `src/runtime/`. Do not
  keep runtime bridges, runtime config builders, or runtime error mapping under
  generic `lib/` or `shared/errors/`.
- Pure cross-feature utilities belong under `src/shared/lib/`, not a root-level
  `src/lib/`.
- Feature-specific hooks should move into their owning feature directories once
  the feature boundary exists. Keep root-level `src/hooks/` only for hooks that
  have not yet been assigned to a stable feature or shared boundary.
- Project-specific actions such as save, load, share, and settings belong in
  the workspace page header, close to the editor/visualization workflow.
- Keep the variables surface visible in the main workspace. Use one add-entry
  point (for example a small add menu) to branch into identifier picking or
  advanced expressions instead of duplicating those controls across the page.
- When advanced expression entry exists in the editor surface, do not duplicate
  the same input again inside the variables panel. The variables panel should
  focus on watched-variable cards and actions.
- Watched-variable configuration should keep a sidebar-style variable switcher
  inside the modal so users can move between watched variables without closing
  settings.
- Save-to-collection flows should default to the active project name. Project
  settings travel with the project and should be persisted together with code,
  watch state, and rendered visuals.
- Advanced watch expressions must validate against variables that actually exist
  in the current source. Do not silently accept roots that the user cannot run.
- If the workspace offers multiple layout modes, label them by interaction
  difference (for example stacked panels vs floating windows), not by vague
  internal terms alone.
- Settings pages should expose a clear breadcrumb or clickable project name so
  users can return to the main workspace without relying on hidden navigation.
- Saved collections should surface a human-readable preview summary when
  rendered visuals exist; do not collapse them back into raw tables unless a
  dense admin workflow explicitly requires it.

- All user-visible failures must either render an inline friendly error state or route through the app-level error owner; do not leave promise rejections or render crashes unhandled.
- New browser-side async flows should register one clear escalation path for unexpected errors (for example: local friendly state first, then app-level modal fallback).
- When adding a new runtime, graph, or SVG rendering surface, include explicit error normalization and a visible fallback state.
- Error boundaries should stay layered: app boundary at `src/components/AppErrorBoundary.tsx`, page boundaries in `src/app/`, feature boundaries around high-risk panels, and renderer-level inline fallbacks inside graph/SVG surfaces.

# Validation record

Date: 2026-09-06.

## Automated checks actually executed

| Suite | Environment | Result |
| --- | --- | --- |
| Core unit tests | Node.js 22.16.0 | 11 passed, 0 failed |
| Browser integration checks | Chromium 144.0.7559.96, Python Playwright, 1600 × 1000 viewport | 42 passed, no uncaught application JavaScript exceptions |
| Browser renderer used | In-memory document | Canvas 2D fallback |
| Storage available in browser run | Opaque in-memory origin | Memory-only fallback |

`test-results/browser-results.json` contains the recorded browser checks and console output. Console policy messages from deliberately sandboxed author content are not equivalent to uncaught application exceptions.

The browser test environment did not permit ordinary localhost/file navigation. The app was therefore loaded using Playwright `set_content` into an in-memory document. That verifies meaningful editor behavior, but **does not validate WebGPU device/pipeline startup or IndexedDB/localStorage persistence on a normal origin**. No hardware-GPU performance or universal browser-compatibility claim is made.

## Core coverage

Path normalization/traversal rejection; relative references; history deduplication, branching, and retention; file operations; schema rejection; standard CRC32 vector; ZIP round trip with Unicode filenames and binary bytes; corruption detection; invalid/truncated archives; data-URI conversion; and HTML escaping.

## Browser coverage

Application initialization; initial file/page inventory; stylesheet/image resolution; actual backend label; native text input; undo and redo; semantic range formatting; inspector attributes and CSS dimensions; insertion, duplication, deletion, and DOM Layers; Split synchronization; source find/replace; preview content, internal navigation, local scripts, and host-origin isolation; table rows/columns; actual responsive iframe width; Folders/Reports/Navigation/Hyperlinks/Tasks views; task creation/completion; new nested page and stylesheet resolution; rename; website ZIP validity, clean export, and original asset/script references; project backup; ZIP re-import; scripts disabled in Design and enabled in isolated Preview; and absence of uncaught application errors.

## Reproduce

```sh
npm run build
npm test

# Development-only browser testing dependency:
python -m pip install playwright
python -m playwright install chromium
CHROMIUM_PATH=/absolute/path/to/chromium npm run test:e2e
```

With `npm start` running separately, test a normal origin:

```sh
PAGEFORGE_TEST_URL=http://127.0.0.1:4173 \
CHROMIUM_PATH=/absolute/path/to/chromium npm run test:e2e
```

The supplied automated browser launcher requests a software graphics configuration for reproducibility. A real hardware validation should use the normal browser without those test flags and confirm the WebGPU status badge before inspecting device diagnostics and rendering.

## Remaining manual / platform validation

Verify IndexedDB save/reload and quota failures, localStorage fallback, hardware WebGPU startup and loss recovery, cross-tab simultaneous saves, clipboard permissions, IME across supported languages, touch/pen resize interactions, complex table spans, large-project latency/memory behavior, and accessibility with real assistive technologies. macOS/Safari, Firefox, and mobile browsers were not tested here.

The package also includes clean screenshots of Design, Split, and mobile-width Preview. These are actual application captures, not mockups.

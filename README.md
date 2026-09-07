# PageForge Studio

[Open the live editor](https://wieslawsoltes.github.io/PageForgeStudio/) · [Deployment workflow](https://github.com/wieslawsoltes/PageForgeStudio/actions/workflows/pages.yml)

A working, local-first visual website editor in **plain HTML, CSS, and JavaScript**, with a FrontPage/Office 2003-inspired workspace and an actual WebGPU editor-overlay renderer. No framework, CDN, runtime package, account, or backend is required.

The application opens with **Monograph Studio**, an editable, four-page architecture website with a shared stylesheet, client-side JavaScript, and an original embedded SVG illustration.

**Rendering boundary:** the browser renders HTML, CSS, text, selection, and composition. WebGPU renders selection outlines, element boundaries, and layout guides. The application does not attempt to replace the browser's entire layout/typography engine. Canvas 2D is the automatic overlay fallback.

## Run

With Node.js 22 or newer:

```sh
npm start
```

Open `http://127.0.0.1:4173`. There is **no `npm install` step**. The development server binds to loopback by default. Override `HOST` or `PORT` explicitly when needed.

`index.html` is already built and entirely self-contained. It can also be opened directly, although a localhost or HTTPS origin is recommended for browser storage, clipboard permissions, and WebGPU. The status bar reports the real renderer and storage state instead of pretending those services are available.

## What works

| Area | Implemented behavior |
| --- | --- |
| Workspace | FrontPage-style menus and toolbars, Folder List, document tabs, Views rail, Task Pane, status bar, Classic Blue and Classic Silver themes. |
| Document views | Design, vertically resizable Split, Code, and sandboxed Preview. |
| Visual editing | Native typing and text selection, semantic range formatting, paragraphs/headings, lists, alignment, fonts, colors, indentation, CSS properties, and attributes. |
| Structure | Select DOM nodes, inspect breadcrumbs and Layers, duplicate/delete/reorder elements, drag components, and drag resize handles. |
| Insert | 13 reusable components; hyperlink, image, HTML-fragment, and table dialogs; image upload; row and column commands. |
| Source | HTML/CSS/JavaScript source editing, syntax highlighting, line numbers, find/replace, Tab indentation, and basic HTML formatting. |
| Website files | Create blank/studio/landing pages or source files; open tabs; rename/delete; update common relative references on rename. |
| Preview | Actual CSS media-query behavior at desktop/tablet/phone widths, zoom, local image and stylesheet resolution, local page navigation, isolated classic JavaScript execution. |
| Website management | File inventory, local-link and metadata reports, page navigation inventory, hyperlink inventory, and project tasks. |
| Persistence | IndexedDB with localStorage fallback, debounced autosave, serialized writes, dirty-state indication, and cross-tab save notification. |
| Portable files | Import files, stored/deflated ZIP archives, and `.pageforge` project backups; export current file, full static-site ZIP, or project backup. |

A project backup contains files, project metadata, and tasks. It does **not** include the in-memory undo stack or global preferences. Website ZIP exports contain only the website's files, not the editor runtime or tasks.

## Quick workflow

Click a paragraph or heading and type. Select text before applying inline formatting. Edit dimensions and styles in **Properties**; use **Insert** for reusable elements and **Layers** for structural selection.

Use **Split** to edit source while viewing the page. Use **Preview** to execute local scripts and follow internal links. **Publish website** prepares a normal static-site ZIP; it is not an FTP client or a remote deployment service.

**File → Save project backup** is the portable-save operation. **Save locally** writes to this browser's current origin. When the application reports **Memory only**, export a project backup before leaving.

## Project layout

```text
index.html                     Ready-to-run standalone application
src/core.js                    Project schema, paths, history, persistence
src/editor.js                  Virtual document runtime and DOM editor
src/renderer.js                WGSL WebGPU compositor and Canvas fallback
src/zip.js                     ZIP32 reader/writer and CRC32
src/templates.js               Sample website and component library
src/ui.js                      Application shell and SVG icons
src/app.js                     Commands, dialogs, source editor, site views
src/app.css                    Classic desktop styling
build.mjs                      Zero-dependency deterministic bundler
server.mjs                     Loopback-only development server by default
tests/core.test.js             Node unit tests
tests/browser_test.py          Python Playwright integration suite
docs/ARCHITECTURE.md            Implementation contracts and extension points
docs/TESTING.md                 Recorded results and untested areas
.github/workflows/pages.yml    Test, build, and GitHub Pages deployment workflow
```

## Build and test

```sh
npm run build
npm test
```

The build writes the same application to `index.html` and `dist/index.html`. `dist/` can be uploaded to an ordinary static host. The GitHub Pages workflow runs the core tests, rebuilds the site, and deploys `dist/` on every push to `main`. It can also be run manually from the Actions tab. In repository Settings → Pages, the publishing source should be **GitHub Actions**.

The browser suite has an optional development dependency on Python Playwright:

```sh
python -m pip install playwright
python -m playwright install chromium
CHROMIUM_PATH=/path/to/chromium npm run test:e2e
```

On an unrestricted development machine, test the served origin as well:

```sh
PAGEFORGE_TEST_URL=http://127.0.0.1:4173 \
CHROMIUM_PATH=/path/to/chromium npm run test:e2e
```

See `docs/TESTING.md` for exactly what was verified. The provided run passed 11 unit tests and 42 integration checks in Chromium's Canvas/memory fallback configuration. Hardware WebGPU and persistent-storage reload behavior were not exercised in that run.

## Scope and limitations

This is an independent modern implementation, **not complete Microsoft FrontPage compatibility**. It does not implement FrontPage Server Extensions, ASP/database wizards, FTP, source control, real-time collaboration, or server-side forms. The sample contact form is client-side only.

Design mode uses the browser's HTML parser and serialization; editing there is not byte-preserving. Undo/redo is per-file content history, not project-wide file-operation history. Complex table spans are not semantically remapped by the simple row/column tools. Reports are heuristics, not an HTML validator, crawler, or WCAG certification.

Preview intentionally blocks network fetches, form submissions, and nested frames. Local classic script files are inlined. Module import graphs, full build pipelines, and arbitrary server applications are outside this release. External HTTPS images/styles/fonts may still make resource requests; this is not an offline or zero-egress guarantee for arbitrary imported websites.

See `docs/ARCHITECTURE.md` for further security and performance boundaries before treating the editor as an untrusted-content service.

## License

MIT. Original application code, SVG icons, and sample artwork are included. Microsoft and FrontPage are names of their respective owner; this project is not affiliated with or endorsed by Microsoft.

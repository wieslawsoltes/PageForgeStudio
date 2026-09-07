# Architecture and implementation contracts

## 1. Canonical document ownership

`ProjectModel` owns the canonical source text and file metadata. A project has a version, name, active path, files, and tasks. Text files are strings; binary assets are base64 data URIs. Paths are project-relative and normalized. File lookup is currently a linear array search, appropriate for the configured 512-file import ceiling rather than a million-file repository.

`DocumentRuntime.prepare()` creates a renderable derivative of one HTML file. It resolves local styles and images using the virtual filesystem, preserves authored references, disables active scripts in Design, and injects editor-only policy/style nodes. The derivative is never used directly as the exported site.

`VisualEditor.serialize()` clones the edited document, removes runtime-only nodes, restores stylesheet/image references and preserved scripts, removes editor-owned body attributes, and returns canonical HTML. Browser HTML parsing normalizes markup and doctypes. The code editor preserves its source string until a visual edit or a normalizing command changes it.

An imported author element using reserved `data-pf-*` attributes can conflict with internal markers. These attributes belong to the editor runtime; this initial implementation does not provide a separate provenance map for hostile author markup.

## 2. Editing and synchronization

The editable Design iframe has `sandbox="allow-same-origin"` without `allow-scripts`. The host can use its DOM; author scripts cannot execute in that frame. Native contenteditable supplies selection, typing, browser text shaping, and composition.

Visual typing is grouped by a 300 ms debounce. Composition suppresses commits until `compositionend`. Source edits are grouped by a 350 ms debounce. Mode/file transitions flush pending changes. Programmatic visual commands use `transaction(label, action)`, capture a selection bookmark, serialize the result, and push a history entry.

Bookmarks are DOM child-index paths with selection offsets, restored defensively after reload. They are not permanent node identifiers and cannot provide collaborative conflict resolution. Range formatting uses DOM Range extraction/insertion, not `execCommand`. Formatting across elaborate mixed block structures is not a full rich-text schema transformation system.

History is per-file, snapshot-based, deduplicated, and capped at 160 entries. Pushing after undo discards the redo branch. Structural file creation/deletion and project metadata are not part of a project-wide undo transaction. History retention is count-bounded, **not byte-budgeted**; editing very large files repeatedly can use substantial memory.

## 3. GPU overlay pipeline

The HTML page remains native DOM. The editor reads `getBoundingClientRect()` results for the selected element and optional boundaries, transforms them into sheet coordinates, and emits rectangles.

Each rectangle is eight float32 values:

```text
x, y, width, height, red, green, blue, alpha
```

The renderer preallocates capacity for 8,192 instances and creates a vertex buffer with a 32-byte instance stride. A vertex shader emits six triangle-list vertices from the vertex index and rectangle dimensions. The fragment output is premultiplied RGBA, matching the transparent canvas's premultiplied-alpha configuration. One uniform buffer contains the logical viewport size and padding.

For a dirty paint, the renderer uploads the occupied instance prefix, encodes a transparent-clear render pass, and issues `draw(6, instanceCount)`. Rasterization uses the physical canvas size; geometry uses logical viewport coordinates. Device pixel ratio is capped at three to limit backing-store growth.

A coalesced `requestAnimationFrame` invalidation gate schedules paints after selection, mutation, scroll, resize, or guide changes. There is no permanent animation loop when the editor is idle. DOM resize-handle hit targets sit above the overlay; they update real CSS width/height.

The Canvas 2D fallback consumes the same instance data. If adapter acquisition, initialization, or device operation fails, the canvas is replaced so a 2D context can be acquired after a WebGPU context was attempted. The visible renderer badge reflects the actual backend.

`lastSubmissionMs` is CPU-side submission elapsed time. It is not a GPU timestamp, frame-rate measurement, or evidence of throughput. No hardware benchmark is claimed.

## 4. Preview trust boundary

Preview uses a separate iframe with `sandbox="allow-scripts"` and no `allow-same-origin`. It has an opaque origin rather than access to the host document/storage. Local classic script files are inlined into its generated document. Authored page navigation is mediated by `postMessage`; the host verifies the sending window and channel, then only accepts a path to an existing project HTML file.

An injected Content Security Policy blocks `connect-src`, `form-action`, nested frames, objects, and base URLs. Styles, images, fonts, and media may use local data/blob resources or HTTPS resources. This permits normal design assets but is not a zero-network policy.

The sandbox does not stop expensive author JavaScript from consuming CPU or causing a renderer-process hang. This is a local authoring tool, not a hardened hostile-code execution service. Deploying it as a multi-user editor would require a separate-origin preview service, stronger resource policy, quotas, timeouts, project authorization, and threat-model-specific review.

## 5. Persistence and conflict signaling

`ProjectStore` attempts IndexedDB first, then localStorage, then an explicit memory-only state. Autosave waits 650 ms after changes and serializes writes through a promise chain. Revision comparison clears the dirty indicator only for the revision actually persisted. Transaction failures retain dirty state and show a warning.

A BroadcastChannel save notification pauses autosaving in other tabs. This reduces accidental overwrites; it is **not** transactional multi-tab locking or a collaborative merge algorithm. Simultaneous writes can still race before notifications arrive. Exported backups are the durable, user-controlled recovery mechanism.

## 6. ZIP and import boundary

`createZip()` emits stored ZIP32 entries with UTF-8 filenames, CRC32, a central directory, and an end record. `readZip()` accepts stored and deflated entries, using the browser's `DecompressionStream('deflate-raw')` for deflate. Decompression output is counted before aggregation, and length/CRC are verified.

Import validation caps the number of files at 512, individual stored project content at 12 MiB, and aggregate stored project content at 48 MiB. The base64 representation contributes to project validation size, so the largest binary file accepted in a project backup is smaller than 12 MiB of raw binary. ZIP expanded sizes have their own checks. Current individual-file additions check raw file size/count; aggregate limits are strongest at full-project validation/import, not uniformly enforced after every edit.

Encrypted archives, multi-volume archives, unsupported methods, malformed offsets, duplicates, and escaping paths are rejected. ZIP64, legacy filename encodings, and archive-format forensics are not implemented. File input is not a malware-scanning service.

## 7. Performance profile and extension points

The browser handles page layout; the overlay compositor batches rectangles. The remaining costs include DOM bounds reads, full-document serialization after editing, full snapshots for history, source highlighting, and main-thread archive handling. Large projects should be profiled rather than assumed fast because WebGPU is enabled.

Useful next architectural steps are a byte-budgeted diff/operation history, stable node identity, incremental source/DOM mapping, worker-based archive and report processing, chunked virtual-file indexing, full CSS/module resolution, and independent hardware/browser-matrix testing. These are extension points, not features claimed by this release.

## Primary API references

- WebGPU specification: https://www.w3.org/TR/webgpu/
- GPUCanvasContext configuration: https://developer.mozilla.org/en-US/docs/Web/API/GPUCanvasContext/configure
- HTML iframe sandbox: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe
- HTML editing model: https://html.spec.whatwg.org/multipage/interaction.html#contenteditable

Reviewed 2026-09-06. Implementation-specific details above refer to the source shipped in this package.

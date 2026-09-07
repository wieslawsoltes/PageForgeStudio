import { escapeHTML } from './core.js';
const iconPaths = {
  page:'M5 3h9l5 5v13H5z M14 3v5h5 M8 12h8 M8 16h8',
  folder:'M3 6h7l2 2h9v12H3z M3 10h18',
  folderOpen:'M3 8V5h7l2 3h8v3 M3 11h19l-3 9H3z',
  save:'M4 3h14l3 3v15H3V3z M7 3v6h10V3 M7 21v-8h10v8 M14 5v2',
  export:'M12 3v12 M7 8l5-5 5 5 M4 14v7h16v-7',
  import:'M12 3v12 M7 10l5 5 5-5 M4 15v6h16v-6',
  undo:'M9 5L4 10l5 5 M4 10h10a6 6 0 0 1 0 12',
  redo:'M15 5l5 5-5 5 M20 10H10a6 6 0 0 0 0 12',
  cut:'M7 8l11 13 M7 16L18 3 M7 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M7 17a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  copy:'M8 7h13v14H8z M4 17H2V2h13v2',
  paste:'M8 5H4v16h16V5h-4 M8 3h8v5H8z M8 12h8 M8 16h8',
  bold:'M7 4h6a4 4 0 0 1 0 8H7 M7 12h7a4 4 0 0 1 0 8H7V4',
  italic:'M10 4h9 M5 20h9 M14 4L9 20',
  underline:'M6 3v9a6 6 0 0 0 12 0V3 M4 22h16',
  left:'M3 5h18 M3 10h12 M3 15h18 M3 20h12',
  center:'M3 5h18 M6 10h12 M3 15h18 M6 20h12',
  right:'M3 5h18 M9 10h12 M3 15h18 M9 20h12',
  justify:'M3 5h18 M3 10h18 M3 15h18 M3 20h18',
  list:'M9 5h12 M9 12h12 M9 19h12 M3 5h1 M3 12h1 M3 19h1',
  ordered:'M9 5h12 M9 12h12 M9 19h12 M2 3h2v5 M2 8h4 M2 14q4-4 4 0l-4 5h4',
  indent:'M11 5h10 M11 12h10 M11 19h10 M2 7l5 5-5 5',
  outdent:'M11 5h10 M11 12h10 M11 19h10 M7 7l-5 5 5 5',
  link:'M10 14l4-4 M8 15l-2 2a4 4 0 0 1-5-5l5-5a4 4 0 0 1 6 0 M16 9l2-2a4 4 0 0 1 5 5l-5 5a4 4 0 0 1-6 0',
  image:'M3 3h18v18H3z M3 17l6-6 4 4 3-3 5 6 M15 7h.01',
  table:'M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18',
  preview:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  globe:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M3 12h18 M12 3c-5 5-5 13 0 18 5-5 5-13 0-18',
  search:'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0z M15 15l6 6',
  code:'M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18',
  css:'M4 3h16l-2 17-6 2-6-2z M8 8h9l-1 4H9l1 4 3 1 3-1',
  js:'M4 3h16v18H4z M9 8v8q0 3-3 1 M17 9q-5-3-5 1c0 3 5 1 5 4s-5 3-5 1',
  design:'M4 4h16v16H4z M4 9h16 M10 9v11',
  split:'M3 3h18v18H3z M3 12h18 M7 6l-2 2 2 2 M17 6l2 2-2 2',
  reports:'M4 3h16v18H4z M8 17v-5 M12 17V7 M16 17v-8',
  navigation:'M9 3h6v5H9z M2 16h6v5H2z M16 16h6v5h-6z M12 8v4 M5 16v-4h14v4',
  tasks:'M5 3h15v18H5z M3 7l2 2 4-4 M10 8h7 M8 13h9 M8 17h9',
  desktop:'M2 3h20v14H2z M12 17v4 M7 21h10',
  tablet:'M5 2h14v20H5z M11 19h2',
  phone:'M7 2h10v20H7z M10 5h4 M11 19h2',
  plus:'M12 4v16 M4 12h16',
  close:'M6 6l12 12 M6 18L18 6',
  chevron:'M9 5l7 7-7 7',
  down:'M5 9l7 7 7-7',
  up:'M5 15l7-7 7 7',
  trash:'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  settings:'M9 3h6l1 4 4 1 2 5-3 3v4l-5 2-3-3-4 1-3-4 2-4-1-4z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  help:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M9 8a3 3 0 1 1 4 3c-1 1-1 1-1 3 M12 17h.01',
  check:'M4 12l5 5L20 6',
  grid:'M3 3h18v18H3z M3 9h18 M3 15h18 M9 3v18 M15 3v18',
  layers:'M2 7l10-5 10 5-10 5z M2 12l10 5 10-5 M2 17l10 5 10-5',
  heading:'M5 4v16 M19 4v16 M5 12h14',
  paragraph:'M13 4v17 M18 4v17 M21 4H9a5 5 0 0 0 0 10h4',
  button:'M3 6h18v12H3z M7 12h10 M14 9l3 3-3 3',
  columns:'M3 4h7v16H3z M14 4h7v16h-7z',
  section:'M3 4h18v16H3z M7 8h10 M7 12h7 M7 16h10',
  quote:'M3 6h7v7H4c0 4 2 5 5 5 M14 6h7v7h-6c0 4 2 5 5 5',
  form:'M3 3h18v18H3z M7 7h10 M7 11h10 M7 16h5',
  divider:'M2 12h20 M6 8v8 M18 8v8',
  spacer:'M3 3h18 M3 21h18 M12 6v12 M8 9l4-3 4 3 M8 15l4 3 4-3',
  cards:'M2 4h5v16H2z M10 4h5v16h-5z M18 4h5v16h-5z',
  palette:'M12 3a9 9 0 0 0 0 18h2a2 2 0 0 0 1-4c-2-1-1-4 2-4h2c5-5-1-10-7-10z M7 9h.01 M11 6h.01 M16 7h.01 M6 14h.01',
  warning:'M12 3L1 21h22z M12 9v5 M12 17h.01',
  pin:'M8 3h8l-1 6 4 4h-6v8l-2-3v-5H5l4-4z',
  clear:'M14 3l8 8-11 11H7l-6-6z M7 10l8 8 M11 22h11',
  refresh:'M20 8a8 8 0 1 0 0 8 M20 3v5h-5',
  color:'M4 18L12 3l8 15 M7 12h10 M3 22h18',
  home:'M2 11l10-9 10 9 M5 9v13h14V9 M10 22v-8h4v8',
  clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M12 7v5l3 2',
  terminal:'M4 5l7 7-7 7 M13 19h7',
  arrow:'M4 12h16 M14 6l6 6-6 6',
  external:'M14 3h7v7 M21 3L10 14 M10 3H3v18h18v-7',
  rename:'M14 3l7 7-11 11H3v-7z M11 6l7 7'
};
export function icon(name,cls=''){return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${iconPaths[name]||iconPaths.page}"/></svg>`;}
export function tool(command,name,iconName=command,extra=''){return `<button class="tool" data-cmd="${command}" title="${escapeHTML(name)}" aria-label="${escapeHTML(name)}" ${extra}>${icon(iconName)}</button>`;}
export function fileIcon(path){return /\.css$/i.test(path)?'css':/\.[cm]?js$/i.test(path)?'js':/\.(svg|png|jpe?g|gif|webp|ico)$/i.test(path)?'image':/\.html?$/i.test(path)?'page':'code';}
export function createShell(){return `
<div class="app" id="app">
  <header class="titlebar"><div class="app-brand"><span class="app-logo">${icon('page')}</span><strong>PageForge <span>Studio</span></strong><span class="title-divider"></span><span id="project-title">Monograph Studio</span></div><div class="title-right"><span class="engine-badge" id="engine-badge"><i></i><span>Starting renderer</span></span><button data-cmd="help" class="title-button" aria-label="Help">${icon('help')}</button></div></header>
  <div class="menubar" role="menubar">${['File','Edit','View','Insert','Format','Table','Tools','Window','Help'].map(n=>`<button role="menuitem" aria-haspopup="true" data-menu="${n}">${n}</button>`).join('')}<span class="menu-spacer"></span><span class="workspace-label">THE WEB, YOUR WAY.</span></div>
  <div class="toolbar standard-toolbar"><span class="grip"></span>${tool('new','New page (Ctrl+N)','page')}${tool('import','Import files or website (Ctrl+O)','folderOpen')}${tool('save','Save locally (Ctrl+S)','save')}<span class="separator"></span>${tool('cut','Cut','cut')}${tool('copy','Copy','copy')}${tool('paste','Paste','paste')}<span class="separator"></span>${tool('undo','Undo (Ctrl+Z)','undo','id="undo-tool"')}${tool('redo','Redo (Ctrl+Shift+Z)','redo','id="redo-tool"')}<span class="separator"></span>${tool('find','Find and replace (Ctrl+F)','search')}${tool('link','Insert hyperlink (Ctrl+K)','link')}${tool('image','Insert image','image')}${tool('table','Insert table','table')}<span class="separator"></span>${tool('preview','Preview website','preview')}${tool('reports','Website reports','reports')}${tool('boundaries','Show element boundaries','grid','id="boundaries-tool"')}<span class="toolbar-stretch"></span><span class="local-indicator" id="local-indicator">${icon('check')} Saved locally</span><button class="publish-button" data-cmd="publish">${icon('globe')} Publish website <span>▾</span></button></div>
  <div class="toolbar format-toolbar" id="format-toolbar"><span class="grip"></span><select id="block-format" aria-label="Paragraph style"><option value="p">Paragraph</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="h4">Heading 4</option><option value="blockquote">Block quote</option><option value="pre">Preformatted</option><option value="div">Division</option></select><select id="font-family" aria-label="Font family"><option value="Arial, Helvetica, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="'Times New Roman', serif">Times New Roman</option><option value="Verdana, sans-serif">Verdana</option><option value="Tahoma, sans-serif">Tahoma</option><option value="system-ui, sans-serif">System UI</option><option value="'Courier New', monospace">Courier New</option></select><select id="font-size" aria-label="Font size">${[10,11,12,14,16,18,20,24,28,32,40,48,56,64,72].map(v=>`<option value="${v}px" ${v===16?'selected':''}>${v}</option>`).join('')}</select><span class="separator"></span>${tool('bold','Bold (Ctrl+B)')}${tool('italic','Italic (Ctrl+I)')}${tool('underline','Underline (Ctrl+U)')}<span class="separator"></span>${tool('left','Align left')}${tool('center','Align center')}${tool('right','Align right')}${tool('justify','Justify')}<span class="separator"></span>${tool('ul','Bulleted list','list')}${tool('ol','Numbered list','ordered')}${tool('outdent','Decrease indent')}${tool('indent','Increase indent')}<span class="separator"></span><label class="color-tool" title="Text color">${icon('color')}<input id="text-color" type="color" value="#163438" aria-label="Text color"></label><label class="color-tool highlight-tool" title="Highlight color">${icon('palette')}<input id="highlight-color" type="color" value="#e9ed9a" aria-label="Highlight color"></label>${tool('clear','Clear formatting','clear')}<span class="toolbar-stretch"></span><button class="text-tool" data-cmd="page-properties">${icon('settings')} Page properties</button></div>
  <main class="workspace" id="workspace">
    <nav class="views-rail" aria-label="Website views">${[['page','Page','design'],['folders','Folders','folder'],['reports','Reports','reports'],['navigation','Navigation','navigation'],['hyperlinks','Hyperlinks','link'],['tasks','Tasks','tasks']].map(([id,label,i])=>`<button data-view="${id}" class="view-button ${id==='page'?'active':''}" title="${label} view">${icon(i)}<span>${label}</span></button>`).join('')}<div class="rail-bottom"><button data-cmd="settings" title="Preferences" aria-label="Preferences">${icon('settings')}</button></div></nav>
    <aside class="folder-pane" id="folder-pane"><div class="pane-heading"><strong>Folder List</strong><div>${tool('new','New file','plus')}${tool('toggle-folders','Hide folder list','close')}</div></div><div class="site-root">${icon('globe')}<span id="site-root-name">Monograph Studio</span></div><div class="file-search">${icon('search')}<input type="search" id="file-filter" placeholder="Find a file…" aria-label="Find a file"></div><div id="file-tree" class="file-tree" role="tree" aria-label="Project files"></div><div class="folder-footer"><div class="mini-caption">YOUR WORKSPACE</div><button data-cmd="new">${icon('plus')} Create a new page</button><button data-cmd="import">${icon('import')} Import files</button><div class="local-note"><span class="safe-dot"></span><span>Local-first. Your files stay yours.</span></div></div></aside>
    <section class="document-pane"><div class="document-tabs" id="document-tabs"></div>
      <div class="document-toolbar"><div class="document-location">${icon('page')}<span id="document-location">index.html</span><span class="file-type-badge" id="file-type-badge">HTML</span></div><div class="viewport-tools"><button class="device-button active" data-device="0" aria-label="Responsive desktop" title="Responsive desktop">${icon('desktop')}</button><button class="device-button" data-device="768" aria-label="Tablet 768 pixels" title="Tablet · 768px">${icon('tablet')}</button><button class="device-button" data-device="390" aria-label="Phone 390 pixels" title="Phone · 390px">${icon('phone')}</button><span class="small-separator"></span><select id="viewport-width" aria-label="Viewport width"><option value="0">Responsive</option><option value="1440">1440 px</option><option value="1280">1280 px</option><option value="1024">1024 px</option><option value="768">768 px</option><option value="390">390 px</option></select><select id="zoom-level" aria-label="Canvas zoom">${[50,67,75,90,100,110,125,150,200].map(n=>`<option value="${n/100}" ${n===100?'selected':''}>${n}%</option>`).join('')}</select></div></div>
      <div class="editor-workspace" id="editor-workspace" data-mode="design"><div class="source-panel" id="source-panel"><div class="source-heading"><span>${icon('code')} <span id="source-label">HTML source</span></span><div><button data-cmd="format-code">Format</button><span>UTF-8</span></div></div><div class="find-bar" id="find-bar" hidden><input id="find-input" placeholder="Find in source" aria-label="Find text"><input id="replace-input" placeholder="Replace with" aria-label="Replacement text"><button data-cmd="find-next">Next</button><button data-cmd="replace-one">Replace</button><button data-cmd="replace-all">All</button><span id="find-count"></span><button data-cmd="close-find" aria-label="Close find">×</button></div><div class="source-editor"><div class="line-numbers" id="line-numbers">1</div><div class="source-text"><pre class="syntax-highlight" id="syntax-highlight" aria-hidden="true"></pre><textarea id="source-input" wrap="off" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Source code editor"></textarea></div></div><div class="source-status"><span id="source-position">Ln 1, Col 1</span><span>Changes apply automatically</span></div></div>
      <div class="split-handle" id="split-handle" title="Drag to resize split"></div>
      <div class="design-stage" id="design-stage"><div class="ruler horizontal-ruler" id="ruler"></div><div class="sheet" id="sheet"><iframe id="design-frame" title="Editable website design" sandbox="allow-same-origin"></iframe><iframe id="preview-frame" title="Isolated website preview" sandbox="allow-scripts" hidden></iframe><canvas id="overlay-canvas" aria-hidden="true"></canvas><div id="selection-label" class="selection-label" hidden></div><div id="resize-handles"></div><div id="resize-shield" hidden></div></div><div class="preview-notice" id="preview-notice" hidden>${icon('preview')} Preview · scripts isolated from the editor</div></div>
      <div class="site-view" id="site-view" hidden></div></div>
      <div class="tag-bar"><span class="tag-caption">${icon('code')} DOM</span><div id="tag-path"></div><span id="selection-dimensions"></span></div>
      <div class="view-tabs"><div class="mode-tabs" role="tablist" aria-label="Editor mode">${[['design','Design','design'],['split','Split','split'],['code','Code','code'],['preview','Preview','preview']].map(([id,n,i])=>`<button data-mode="${id}" role="tab" aria-selected="${id==='design'}" class="${id==='design'?'active':''}">${icon(i)} ${n}</button>`).join('')}</div><span class="document-hint" id="document-hint">Click to edit · Esc to select parent</span></div>
    </section>
    <aside class="task-pane" id="task-pane"><div class="pane-heading"><strong>Task Pane</strong>${tool('toggle-inspector','Hide task pane','close')}</div><div class="inspector-tabs" role="tablist">${['Properties','Insert','Layers'].map(n=>`<button data-inspector="${n.toLowerCase()}" role="tab" aria-selected="${n==='Properties'}" class="${n==='Properties'?'active':''}">${n}</button>`).join('')}</div><div class="inspector-content" id="inspector-content"></div><div class="inspector-footer"><span class="safe-dot"></span><span>Native HTML. No lock-in.</span></div></aside>
  </main>
  <footer class="statusbar"><span class="status-message" id="status-message">${icon('check')} Ready</span><span class="status-spacer"></span><span id="status-file-count"></span><span class="status-cell" id="renderer-status">Renderer initializing</span><span class="status-cell" id="viewport-status">Responsive</span><span class="status-cell">HTML5</span><span class="status-cell">UTF-8</span><span class="resize-grip">◢</span></footer>
</div>
<div id="dropdown-menu" class="dropdown-menu" role="menu" hidden></div>
<div id="toast-region" class="toast-region" aria-live="polite"></div>
<dialog id="modal" class="modal"></dialog>
<input id="import-input" type="file" multiple hidden accept=".html,.htm,.css,.js,.mjs,.json,.pageforge,.zip,.svg,.png,.jpg,.jpeg,.webp,.gif,.ico,.woff,.woff2,.md,.txt,.xml,.csv">
<input id="image-import-input" type="file" accept="image/*" hidden>
`;}

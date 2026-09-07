/** Pure document primitives. No framework or third-party runtime. */
export const APP_VERSION = '1.0.0';
export const PROJECT_VERSION = 1;
export const LIMITS = Object.freeze({files:512, fileBytes:12*1024*1024, projectBytes:48*1024*1024, history:160});
export const escapeHTML = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const extension = path => path.split('.').pop().toLowerCase();
export const isHTML = path => /\.html?$/i.test(path);
export const mimeType = path => ({html:'text/html',htm:'text/html',css:'text/css',js:'text/javascript',mjs:'text/javascript',json:'application/json',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',ico:'image/x-icon',woff:'font/woff',woff2:'font/woff2',txt:'text/plain',md:'text/markdown'}[extension(path)]||'application/octet-stream');
export const isTextFile = path => /^(html?|css|js|mjs|json|svg|txt|md|xml|csv)$/i.test(extension(path));
export function normalizePath(path) {
  if(typeof path!=='string'||!path.trim())throw new Error('Enter a file name.');
  path=path.trim().replaceAll('\\','/');
  if(path.startsWith('/')||/^[a-z][a-z\d+.-]*:/i.test(path)||/[\x00-\x1f?#]/.test(path))throw new Error('Use a relative project path without control characters, ? or #.');
  const parts=[];
  for(const p of path.split('/')){if(!p||p==='.')continue;if(p==='..'){if(!parts.length)throw new Error('The path escapes the project.');parts.pop();}else parts.push(p);}
  if(!parts.length||parts.join('/').length>240)throw new Error('The file path is empty or too long.');
  return parts.join('/');
}
export function resolvePath(from, reference) {
  if(!reference||/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference))return null;
  try {const clean=decodeURIComponent(reference.split(/[?#]/)[0]);return normalizePath(clean.startsWith('/')?clean.slice(1):from.slice(0,from.lastIndexOf('/')+1)+clean);}catch{return null;}
}
export function relativePath(from,to) {
  const a=from.split('/');a.pop();const b=to.split('/');while(a.length&&b.length&&a[0]===b[0]){a.shift();b.shift();}return '../'.repeat(a.length)+b.join('/');
}
export function validateProject(input) {
  if(!input||input.version!==PROJECT_VERSION||!Array.isArray(input.files))throw new Error('Not a supported PageForge project.');
  if(input.files.length>LIMITS.files||!input.files.length)throw new Error('A project must contain 1–512 files.');
  let size=0;const paths=new Set();
  const files=input.files.map(f=>{
    const path=normalizePath(f.path);if(paths.has(path))throw new Error('Duplicate path: '+path);paths.add(path);
    if(typeof f.content!=='string')throw new Error('Invalid content: '+path);
    const bytes=new TextEncoder().encode(f.content).byteLength;size+=bytes;
    if(bytes>LIMITS.fileBytes||size>LIMITS.projectBytes)throw new Error('Project exceeds the import size limit.');
    return {path,content:f.content,kind:f.kind==='data'?'data':'text',mime:mimeType(path),modified:Number(f.modified)||Date.now()};
  });
  return {version:PROJECT_VERSION,name:String(input.name||'Untitled website').slice(0,120),files,active:paths.has(input.active)?input.active:files.find(f=>isHTML(f.path))?.path||files[0].path,tasks:Array.isArray(input.tasks)?input.tasks.slice(0,500).map(t=>({id:String(t.id),text:String(t.text).slice(0,500),done:!!t.done})):[]};
}
export class History {
  constructor(content,limit=LIMITS.history){this.limit=limit;this.entries=[{content,label:'Opened',bookmark:null}];this.index=0;}
  get current(){return this.entries[this.index];}
  get canUndo(){return this.index>0;}
  get canRedo(){return this.index<this.entries.length-1;}
  push(content,label='Edit',bookmark=null){if(content===this.current.content)return false;this.entries.splice(this.index+1);this.entries.push({content,label,bookmark});this.index=this.entries.length-1;while(this.entries.length>this.limit){this.entries.shift();this.index--;}return true;}
  undo(){return this.canUndo?this.entries[--this.index]:null;}
  redo(){return this.canRedo?this.entries[++this.index]:null;}
}
export class ProjectModel extends EventTarget {
  constructor(data){super();this.load(data);}
  load(data){this.data=validateProject(data);this.histories=new Map(this.data.files.map(f=>[f.path,new History(f.content)]));this.revision=0;this.savedRevision=0;this.emit('load');}
  emit(kind,detail={}){this.dispatchEvent(new CustomEvent('change',{detail:{kind,...detail}}));}
  get files(){return this.data.files;}
  get active(){return this.get(this.data.active);}
  get history(){return this.histories.get(this.data.active);}
  get(path){return this.files.find(f=>f.path===path);}
  activate(path){if(!this.get(path))return false;this.data.active=path;this.emit('activate',{path});return true;}
  update(path,content,label='Edit',bookmark=null){const f=this.get(path);if(!f||f.content===content)return false;this.histories.get(path).push(content,label,bookmark);f.content=content;f.modified=Date.now();this.revision++;this.emit('edit',{path,label});return true;}
  restore(direction){const entry=this.history[direction]();if(!entry)return null;this.active.content=entry.content;this.active.modified=Date.now();this.revision++;this.emit('history',{path:this.active.path});return entry;}
  add(path,content='',kind='text'){path=normalizePath(path);if(this.get(path))throw new Error('A file with that name already exists.');if(this.files.length>=LIMITS.files)throw new Error('File limit reached.');const f={path,content,kind,mime:mimeType(path),modified:Date.now()};this.files.push(f);this.histories.set(path,new History(content));this.revision++;this.emit('add',{path});return f;}
  rename(oldPath,newPath){newPath=normalizePath(newPath);if(oldPath===newPath)return;if(this.get(newPath))throw new Error('That path already exists.');const f=this.get(oldPath);if(!f)throw new Error('File not found.');f.path=newPath;f.mime=mimeType(newPath);this.histories.set(newPath,this.histories.get(oldPath));this.histories.delete(oldPath);if(this.data.active===oldPath)this.data.active=newPath;this.revision++;this.emit('rename',{oldPath,path:newPath});}
  remove(path){if(this.files.length===1)throw new Error('Keep at least one file in the project.');this.data.files=this.files.filter(f=>f.path!==path);this.histories.delete(path);if(this.data.active===path)this.data.active=this.files.find(f=>isHTML(f.path))?.path||this.files[0].path;this.revision++;this.emit('remove',{path});}
  snapshot(){return structuredClone(this.data);}
}
export class ProjectStore {
  constructor(){this.db=null;this.backend='memory';}
  async open(){try{this.db=await new Promise((resolve,reject)=>{const req=indexedDB.open('pageforge-studio',1);req.onupgradeneeded=()=>req.result.createObjectStore('projects');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Storage is locked by another tab.'));});this.backend='IndexedDB';}catch{try{localStorage.setItem('pf-storage-test','1');localStorage.removeItem('pf-storage-test');this.backend='localStorage';}catch{this.backend='memory';}}return this;}
  async read(){if(this.backend==='IndexedDB')return new Promise((resolve,reject)=>{const req=this.db.transaction('projects').objectStore('projects').get('current');req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});if(this.backend==='localStorage'){const json=localStorage.getItem('pageforge-project');return json?JSON.parse(json):null;}return null;}
  async write(data){if(this.backend==='IndexedDB')return new Promise((resolve,reject)=>{const tx=this.db.transaction('projects','readwrite');tx.objectStore('projects').put(data,'current');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Save aborted'));});if(this.backend==='localStorage'){localStorage.setItem('pageforge-project',JSON.stringify(data));return;}throw new Error('Browser storage is unavailable. Export your project to keep your work.');}
}
export function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
export function bytesFromFile(file){if(file.kind!=='data')return new TextEncoder().encode(file.content);const raw=atob(file.content.slice(file.content.indexOf(',')+1));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
export function dataURI(bytes,mime){let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return 'data:'+mime+';base64,'+btoa(binary);}

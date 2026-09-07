/** Deterministic zero-dependency bundle. Modules are deliberately acyclic and use named exports only. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const modules=['core','zip','renderer','templates','editor','ui','app'];
let script='(function(){\n"use strict";\n';
for(const name of modules){const source=await readFile(`src/${name}.js`,'utf8');if(/\bimport\s*\(/.test(source))throw new Error('Dynamic imports are not supported by this small bundler.');script+='\n// ---- '+name+'.js ----\n'+source.replace(/^import\s+.*?;\s*$/gm,'').replace(/^export\s+(?=(?:async\s+)?(?:class|function|const|let|var)\b)/gm,'')+'\n';}
script+='\n})();';
const css=await readFile('src/app.css','utf8');
const html=`<!DOCTYPE html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="PageForge Studio — a local-first visual website editor with Design, Split, Code and Preview views."><meta name="theme-color" content="#2866ad"><title>PageForge Studio</title><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%232b66ab'/%3E%3Cpath d='M9 5h10l5 5v17H9z' fill='white'/%3E%3Cpath d='M13 14h7m-7 5h7m-7 4h5' stroke='%232b66ab' stroke-width='2'/%3E%3C/svg%3E"><style>${css}</style></head><body><noscript>PageForge Studio needs JavaScript to edit your website.</noscript><script>${script.replaceAll('</script','<\\/script')}</script></body></html>`;
await mkdir('dist',{recursive:true});await writeFile('index.html',html);await writeFile('dist/index.html',html);await writeFile('dist/.nojekyll','');console.log(`Built index.html and dist/index.html (${(Buffer.byteLength(html)/1024).toFixed(1)} KB).`);

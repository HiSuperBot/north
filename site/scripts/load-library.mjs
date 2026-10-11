import fs from 'node:fs/promises';
import { rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Compile the real library graph, including reviewed JSON, without a browser.
const directory=await fs.mkdtemp(path.join(os.tmpdir(),'north-check-'));
const compiled=new Map();
process.on('exit',()=>rmSync(directory,{recursive:true,force:true}));
async function compile(filename){
 filename=path.resolve(filename);
 if(compiled.has(filename))return compiled.get(filename);
 const target=path.join(directory,`${compiled.size}.mjs`);
 compiled.set(filename,pathToFileURL(target).href);
 const input=await fs.readFile(filename,'utf8');
 let output=filename.endsWith('.json')?`export default ${input};`:ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const matches=[...output.matchAll(/from\s+['"]([^'"]+)['"]/g)];
 for(const match of matches){
  if(!match[1].startsWith('.'))continue;
  const dependency=path.resolve(path.dirname(filename),match[1]+(path.extname(match[1])?'':'.ts'));
  const url=await compile(dependency);
  output=output.replace(match[0],`from ${JSON.stringify(url)}`);
 }
 await fs.writeFile(target,output);
 return pathToFileURL(target).href;
}
export async function loadLibrary(filename){return import(await compile(filename));}

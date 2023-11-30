import { generateIcon } from './utils.js';
import fs from 'fs/promises';
const allIconsUrl =
  'https://raw.githubusercontent.com/Templarian/MaterialDesign-JS/master/mdi.d.ts';

const response = await fetch(allIconsUrl);
const text = await response.text();
const icons = text
  .replace(/export declare const mdi/g, '')
  .replace(/: string;/g, '')
  .split('\n').map((icon) => icon.trim());
const work = icons.map((icon) => generateIcon(icon.trim()));
console.log(`Generating ${work.length} icons...`);
await fs.writeFile('src/components/icons/.gitignore', '*', 'utf8');
await Promise.all(work);

console.log('All icons generated');
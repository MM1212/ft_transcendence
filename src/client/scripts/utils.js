import path from 'path';
import fs from 'fs/promises';
/**
 * Return Pascal-Cased component name.
 * @param {string} destPath
 * @returns {string} class name
 */
/* export function getComponentName(destPath) {
  const splitregex = new RegExp(`[\\${path.sep}-]+`);

  const parts = destPath
    .replace('.js', '')
    .split(splitregex)
    .map((part) => part.charAt(0).toUpperCase() + part.substring(1));

  return parts.join('');
} */

export async function generateIcon(icon) {
  const componentName = icon;
  const fileTarget = `src/components/icons/${componentName}Icon.tsx`;

  const fileContent = `
import { createSvgIcon } from '@components/Icon';
import { mdi${componentName} } from '@mdi/js';

const ${componentName}Icon = createSvgIcon(<path d={mdi${componentName}}></path>, '${componentName}');

export default ${componentName}Icon;
`.trim();

  await fs.mkdir(path.dirname(fileTarget), { recursive: true });

  await fs.writeFile(fileTarget, fileContent, 'utf8');
  console.log(`Icon ${icon} created at ${fileTarget}`);
}

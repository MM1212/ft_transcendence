import { generateIcon } from './utils.js';

const icon = process.argv[2];

if (!icon) {
  console.error('No icon provided');
  process.exit(1);
}

generateIcon(icon).catch((err) => {
  console.error(err);
  process.exit(1);
});

// Path: src/client/scripts/generate-icon.js

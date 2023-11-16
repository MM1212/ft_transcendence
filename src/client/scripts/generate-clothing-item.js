import fs from 'fs/promises';
import path from 'path';

const clothId = process.argv[2];

if (!clothId || isNaN(clothId))
  throw new Error('Please provide a valid clothing id');

const REPOSITORY = 'https://media.cplegacy.net/assets/media/clothing/sprites/';
const TARGET_DIR = `public/clothing/${clothId}`;

console.log('Fetching sprite sheet...');
const spriteSheet = await fetch(`${REPOSITORY}${clothId}-0.webp`).then((res) =>
  res.arrayBuffer()
);

console.log(`Making cloth ${clothId} directory...`);
await fs.mkdir(TARGET_DIR, { recursive: true });

console.log(`Writing sprite sheet to ${TARGET_DIR}...`);
await fs.writeFile(
  path.resolve(TARGET_DIR, `asset.webp`),
  new DataView(spriteSheet)
);

console.log(`Fetching sprite sheet json...`);
const spriteSheetJson = await fetch(`${REPOSITORY}${clothId}.json`).then(
  (res) => res.json()
);

console.log('Formatting sprite sheet json...');
const penguinTex = spriteSheetJson.textures[0];
const newObj = {
  meta: {
    ...spriteSheetJson.meta,
    image: 'asset.webp',
    format: penguinTex.format,
    size: penguinTex.size,
    scale: penguinTex.scale.toString(),
  },
  frames: penguinTex.frames
    .sort((a, b) => {
      const [aMajor, aMinor] = a.filename.split('_');
      const [bMajor, bMinor] = b.filename.split('_');
      if (aMajor === bMajor) return aMinor - bMinor;
      return aMajor - bMajor;
    })
    .reduce((acc, { filename, ...tex }) => {
      acc[`${clothId}/${filename}`] = {
        ...tex,
      };
      return acc;
    }, {}),
};

console.log(`Writing sprite sheet json to ${TARGET_DIR}...`);
await fs.writeFile(
  path.resolve(TARGET_DIR, `asset.json`),
  JSON.stringify(newObj)
);
console.log('Done!');

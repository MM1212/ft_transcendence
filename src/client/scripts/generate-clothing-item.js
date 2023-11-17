import fs from 'fs/promises';
import path from 'path';

const generateCloth = async (clothId) => {
  if (!clothId || isNaN(clothId))
    throw new Error('Please provide a valid clothing id');

  const REPOSITORY = 'https://media.cplegacy.net/assets/media/clothing/';
  const TARGET_DIR = `public/penguin/clothing/${clothId}`;

  console.log('Fetching sprite sheet...');
  const spriteSheetResp = await fetch(
    `${REPOSITORY}/sprites/${clothId}-0.webp`
  );

  if (Math.floor(spriteSheetResp.status / 100) === 4)
    throw new Error(
      `Invalid clothing id: ${clothId}, status: ${spriteSheetResp.status}`
    );

  const spriteSheet = await spriteSheetResp.arrayBuffer();

  console.log(`Making cloth ${clothId} directory...`);
  await fs.mkdir(TARGET_DIR, { recursive: true });

  console.log(`Writing sprite sheet to ${TARGET_DIR}...`);
  await fs.writeFile(
    path.resolve(TARGET_DIR, `asset.webp`),
    new DataView(spriteSheet)
  );

  console.log(`Fetching sprite sheet json...`);
  const spriteSheetJson = await fetch(
    `${REPOSITORY}/sprites/${clothId}.json`
  ).then((res) => res.json());

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

  console.log(`Fetching sprite paper...`);
  const spritePaper = await fetch(`${REPOSITORY}/paper/${clothId}.webp`).then(
    (res) => res.arrayBuffer()
  );

  console.log(`Writing sprite paper to ${TARGET_DIR}...`);

  await fs.writeFile(
    path.resolve(TARGET_DIR, `paper.webp`),
    new DataView(spritePaper)
  );

  console.log(`Fetching sprite icon...`);

  const spriteIcon = await fetch(`${REPOSITORY}/icon/${clothId}.webp`).then(
    (res) => res.arrayBuffer()
  );

  console.log(`Writing sprite icon to ${TARGET_DIR}...`);

  await fs.writeFile(
    path.resolve(TARGET_DIR, `icon.webp`),
    new DataView(spriteIcon)
  );
  console.log('Done!');
};

const arg = process.argv[2];

if (arg.includes(',')) await Promise.all(arg.split(',').map(generateCloth));
else await generateCloth(arg);

import fs from 'fs/promises';
import path from 'path';

const generateCloth = async (clothId, backPaper = false) => {
  if (!clothId || isNaN(clothId))
    throw new Error('Please provide a valid clothing id');

  const REPOSITORY = 'https://de7j6vhmj5vf1.cloudfront.net/assets/media/clothing';
  const TARGET_DIR = `public/assets/penguin/clothing/${clothId}`;

  console.log(`Fetching sprite icon...`);

  const spriteIconResp = await fetch(`${REPOSITORY}/icon/${clothId}.webp`);

  if (Math.floor(spriteIconResp.status / 100) === 4)
    throw new Error(
      `Invalid clothing id: ${clothId}, status: ${spriteIconResp.status}`
    );
  const spriteIcon = await spriteIconResp.arrayBuffer();

  console.log(`Making cloth ${clothId} directory...`);
  await fs.mkdir(TARGET_DIR, { recursive: true });

  console.log(`Writing sprite icon to ${TARGET_DIR}...`);

  await fs.writeFile(
    path.resolve(TARGET_DIR, `icon.webp`),
    new DataView(spriteIcon)
  );

  try {
    console.log('Fetching sprite sheet...');
    const spriteSheet = await fetch(
      `${REPOSITORY}/sprites/${clothId}-0.webp`
    ).then((res) => res.arrayBuffer());

    console.log(`Writing sprite sheet to ${TARGET_DIR}...`);
    await fs.writeFile(
      path.resolve(TARGET_DIR, `asset.webp`),
      new DataView(spriteSheet)
    );
  } catch (e) {
    console.warn(`Failed to fetch sprite sheet for ${clothId}, skipping...`);
  }

  try {
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
  } catch (e) {
    console.warn(
      `Failed to fetch sprite sheet json for ${clothId}, skipping...`
    );
  }
  try {
    console.log(`Fetching sprite paper...`);
    const spritePaper = await fetch(
      backPaper
        ? `${REPOSITORY}/paper/${clothId}_back.webp`
        : `${REPOSITORY}/paper/${clothId}.webp`
    ).then((res) => res.arrayBuffer());

    console.log(`Writing sprite paper to ${TARGET_DIR}...`);

    await fs.writeFile(
      path.resolve(TARGET_DIR, `paper.webp`),
      new DataView(spritePaper)
    );
    const repository = JSON.parse(
      await fs.readFile(
        'public/assets/penguin/paper/back_clothing.json',
        'utf-8'
      )
    );
    if (backPaper) repository.push(parseInt(clothId));
    else if (repository.includes(parseInt(clothId)))
      repository.splice(repository.indexOf(parseInt(clothId)), 1);
    // filter repeats
    await fs.writeFile(
      'public/assets/penguin/paper/back_clothing.json',
      JSON.stringify(
        repository.sort((a, b) => a - b).filter((v, i, a) => a.indexOf(v) === i)
      )
    );
  } catch (e) {
    console.warn(`Failed to fetch sprite paper for ${clothId}, skipping...`, e);
  }

  console.log('Done!');
};

const arg = process.argv[2];
const backPaper = process.argv[3] === '--back-paper';

if (arg.includes(',')) await Promise.all(arg.split(',').map(generateCloth));
else await generateCloth(arg, backPaper);

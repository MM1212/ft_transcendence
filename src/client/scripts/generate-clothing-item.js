import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

function parseArgsStringToArgv(
  value,
  env,
  file,
) {
  // ([^\s'"]([^\s'"]*(['"])([^\3]*?)\3)+[^\s'"]*) Matches nested quotes until the first space outside of quotes

  // [^\s'"]+ or Match if not a space ' or "

  // (['"])([^\5]*?)\5 or Match "quoted text" without quotes
  // `\3` and `\5` are a backreference to the quote style (' or ") captured
  const myRegexp =
    /([^\s'"]([^\s'"]*(['"])([^\3]*?)\3)+[^\s'"]*)|[^\s'"]+|(['"])([^\5]*?)\5/gi;
  const myString = value;
  const myArray = [];
  if (env) {
    myArray.push(env);
  }
  if (file) {
    myArray.push(file);
  }
  let match;
  do {
    // Each call to exec returns the next regex match as an array
    match = myRegexp.exec(myString);
    if (match !== null) {
      // Index 1 in the array is the captured group if it exists
      // Index 0 is the matched text, which we use if no captured group exists
      myArray.push(firstString(match[1], match[6], match[0]));
    }
  } while (match !== null);

  return myArray;
}

// Accepts any number of arguments, and returns the first one that is a string
// (even an empty string)
function firstString(...args) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (typeof arg === 'string') {
      return arg;
    }
  }
}

async function run(command, cwd = process.cwd()) {
  return new Promise((resolve) => {
    const args = parseArgsStringToArgv(command);
    const cmd = args.shift();
    if (!cmd) throw new Error('No command');

    const step = spawn(cmd, args, {
      cwd: path.resolve(cwd),
    });

    step.stdout.pipe(process.stdout);
    step.stderr.pipe(process.stderr);

    step.on('close', (code) => {
      resolve(code);
    });
  });
}

const generateCloth = async (clothId, backPaper = false) => {
  if (!clothId || isNaN(clothId))
    throw new Error('Please provide a valid clothing id');

  const REPOSITORY = `${process.env.FRONTEND_PUBLIC_CDN_URL}/clothing`;
  const TARGET_DIR = `public/assets/penguin/clothing/${clothId}`;

  console.log(`Fetching sprite icon from ${`${REPOSITORY}/icon/120/${clothId}.png`}...`);

  const spriteIconResp = await fetch(`${REPOSITORY}/icon/120/${clothId}.png`);

  if (Math.floor(spriteIconResp.status / 100) === 4)
    throw new Error(
      `Invalid clothing id: ${clothId}, status: ${spriteIconResp.status}`
    );
  const spriteIcon = await spriteIconResp.arrayBuffer();

  console.log(`Making cloth ${clothId} directory...`);
  await fs.mkdir(TARGET_DIR, { recursive: true });

  console.log(`Writing sprite icon to ${TARGET_DIR}...`);

  await fs.writeFile(
    path.resolve(TARGET_DIR, `icon.png`),
    new DataView(spriteIcon)
  );
  await run(`convert icon.png icon.webp`, TARGET_DIR);
  await fs.unlink(path.resolve(TARGET_DIR, `icon.png`));

  try {
    console.log('Fetching sprite sheet...');
    const spriteSheet = await fetch(
      `${REPOSITORY}/sprites/${clothId}-0.png`
    ).then((res) => res.arrayBuffer());

    console.log(`Writing sprite sheet to ${TARGET_DIR}...`);
    await fs.writeFile(
      path.resolve(TARGET_DIR, `asset.png`),
      new DataView(spriteSheet)
    );
    await run(`convert asset.png asset.webp`, TARGET_DIR);
    await fs.unlink(path.resolve(TARGET_DIR, `asset.png`));
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
        ? `${REPOSITORY}/paper/${clothId}_back.png`
        : `${REPOSITORY}/paper/${clothId}.png`
    ).then((res) => res.arrayBuffer());

    console.log(`Writing sprite paper to ${TARGET_DIR}...`);

    await fs.writeFile(
      path.resolve(TARGET_DIR, `paper.png`),
      new DataView(spritePaper)
    );
    await run(`convert paper.png paper.webp`, TARGET_DIR);
    await fs.unlink(path.resolve(TARGET_DIR, `paper.png`));
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

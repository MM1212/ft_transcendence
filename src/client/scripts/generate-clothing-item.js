import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { spawn } from 'child_process';

dotenv.config();

function parseArgsStringToArgv(value, env, file) {
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

export async function run(command, cwd = process.cwd()) {
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
// https://media.cplegacy.com/assets/media/penguin/penguin.json?v=2.8.144
export const formatAnimationJson = (data, prefix = '') => {
  const penguinTex = data.textures[0];
  const newObj = {
    meta: {
      ...data.meta,
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
        let key = filename;
        if (prefix) key = `${prefix}/${filename}`;
        acc[key] = {
          ...tex,
        };
        return acc;
      }, {}),
  };
  return newObj;
};

export const generateCloth = async (
  clothId,
  backPaper = false,
  skip = {
    paper: false,
    asset: false,
  }
) => {
  if (!clothId || isNaN(clothId))
    throw new Error('Please provide a valid clothing id');

  const REPOSITORY = `${process.env.FRONTEND_PUBLIC_CDN_URL}/clothing`;
  const TARGET_DIR = `public/assets/penguin/clothing/${clothId}`;

  console.log(
    `Fetching sprite icon from ${`${REPOSITORY}/icon/${clothId}.webp`}...`
  );
  if (await fs.stat(TARGET_DIR).catch(() => null)) {
    console.warn(`Cloth ${clothId} already exists, skipping...`);
    return;
  }

  const spriteIconResp = await fetch(`${REPOSITORY}/icon/${clothId}.webp`);

  if (Math.floor(spriteIconResp.status / 100) === 4)
    throw new Error(
      `Invalid clothing id: ${clothId}, status: ${spriteIconResp.status}`
    );
  const spriteIcon = await spriteIconResp.arrayBuffer();

  console.log(`Making cloth ${clothId} directory...`);
  await fs.mkdir(TARGET_DIR, { recursive: true });
  if (
    !(await fs
      .stat(path.resolve(path.dirname(TARGET_DIR), '.gitignore'))
      .catch(() => null))
  ) {
    await fs.writeFile(
      path.resolve(path.dirname(TARGET_DIR), '.gitignore'),
      '*',
      'utf-8'
    );
  }
  console.log(`Writing sprite icon to ${TARGET_DIR}...`);

  await fs.writeFile(
    path.resolve(TARGET_DIR, `icon.webp`),
    new DataView(spriteIcon)
  );
  // await run(`convert icon.webp icon.webp`, TARGET_DIR);
  // await fs.unlink(path.resolve(TARGET_DIR, `icon.webp`));

  if (!skip.asset) {
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
      // await run(`convert asset.webp asset.webp`, TARGET_DIR);
      // await fs.unlink(path.resolve(TARGET_DIR, `asset.webp`));
    } catch (e) {
      console.warn(`Failed to fetch sprite sheet for ${clothId}, skipping...`);
    }

    try {
      console.log(`Fetching sprite sheet json...`);
      const spriteSheetJson = await fetch(
        `${REPOSITORY}/sprites/${clothId}.json`
      ).then((res) => res.json());

      console.log('Formatting sprite sheet json...');
      const newObj = formatAnimationJson(spriteSheetJson, clothId);

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
  } else {
    console.warn(`Skipping asset config & sheet for ${clothId}`);
  }

  if (!skip.paper) {
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
      // await run(`convert paper.webp paper.webp`, TARGET_DIR);
      // await fs.unlink(path.resolve(TARGET_DIR, `paper.webp`));
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
          repository
            .sort((a, b) => a - b)
            .filter((v, i, a) => a.indexOf(v) === i)
        )
      );
    } catch (e) {
      console.warn(
        `Failed to fetch sprite paper for ${clothId}, skipping...`,
        e
      );
    }
  } else {
    console.warn(`Skipping paper for ${clothId}`);
  }
  console.log('Done!');
};

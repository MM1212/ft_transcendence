import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import {
  formatAnimationJson,
  generateCloth,
  run,
} from './generate-clothing-item.js';
dotenv.config();
const SHOP_CONFIG_PATH = path.resolve(
  process.cwd(),
  'src/server/src/assets/shop/clothing'
);
const CLIENT_PUBLIC_PATH = path.resolve(
  process.cwd(),
  'src/client/public/assets'
);
const BASE_ASSETS = [
  {
    name: 'Main Penguin',
    url: '/penguin/penguin-0.webp',
    target: 'penguin/body/asset.webp',
  },
  {
    name: 'Main Penguin Animations',
    url: '/penguin/penguin.json',
    target: 'penguin/body/asset.json',
    resp: (resp) => resp.json(),
    format: formatAnimationJson,
  },
  {
    name: 'Penguin Base',
    url: '/penguin/penguin_base-0.webp',
    target: 'penguin/base/asset.webp',
  },
  {
    name: 'Penguin Base Animations',
    url: '/penguin/penguin_base.json',
    target: 'penguin/base/asset.json',
    resp: (resp) => resp.json(),
    format: (json) => formatAnimationJson(json, 'base'),
  },
  {
    name: 'Penguin Paper',
    url: '/interface/game/main/main-0.png',
    target: 'penguin/paper/asset.webp',
  },
  {
    name: 'Penguin Paper Animations',
    url: '/interface/game/main/main.json',
    target: 'penguin/paper/asset.json',
    resp: (resp) => resp.json(),
    format: (json) => {
      const formatted = formatAnimationJson(json);
      formatted.frames = {
        'penguin/paperdoll/fixtures': formatted.frames['paperdoll/paperdoll'],
        'penguin/paperdoll/body': formatted.frames['paperdoll/body'],
      };
      return formatted;
    },
  },
];

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function downloadBaseAssets() {
  for await (const asset of BASE_ASSETS) {
    if (
      await fs
        .stat(path.resolve(CLIENT_PUBLIC_PATH, asset.target))
        .catch(() => null)
    ) {
      console.log(`Skipping ${asset.name}..`);
      continue;
    }
    console.log(
      `Downloading ${asset.name} from ${process.env.FRONTEND_PUBLIC_CDN_URL}${asset.url}..`
    );
    const resp = await fetch(
      `${process.env.FRONTEND_PUBLIC_CDN_URL}${asset.url}`
    );
    console.log(`\t- reading data from an ${resp.status}..`);
    const data = await (asset.resp ? asset.resp(resp) : resp.arrayBuffer());
    console.log('\t- formatting..');
    const formatted = asset.format ? asset.format(data) : data;
    console.log(
      `\t- making directories ${path.dirname(
        path.resolve(CLIENT_PUBLIC_PATH, asset.target)
      )}..`
    );
    await fs.mkdir(
      path.dirname(path.resolve(CLIENT_PUBLIC_PATH, asset.target)),
      {
        recursive: true,
      }
    );
    console.log(
      `\t- writing to file ${path.resolve(CLIENT_PUBLIC_PATH, asset.target)}..`
    );
    if (
      !(await fs
        .stat(path.resolve(CLIENT_PUBLIC_PATH, asset.target))
        .catch(() => null))
    ) {
      await fs.writeFile(
        path.resolve(
          CLIENT_PUBLIC_PATH,
          path.dirname(asset.target),
          '.gitignore'
        ),
        '*',
        'utf-8'
      );
    }
    await fs.writeFile(
      path.resolve(CLIENT_PUBLIC_PATH, asset.target),
      formatted instanceof ArrayBuffer
        ? new DataView(formatted)
        : JSON.stringify(formatted)
    );
    if (path.extname(asset.target) !== path.extname(asset.url)) {
      console.warn(`\t- Converting to ${path.extname(asset.target)}...`);
      await run(
        `convert ${asset.target} ${path.dirname(
          asset.target
        )}/_tmp${path.extname(asset.target)}`,
        CLIENT_PUBLIC_PATH
      );
      await fs.unlink(path.resolve(CLIENT_PUBLIC_PATH, asset.target));
      await fs.rename(
        path.resolve(
          CLIENT_PUBLIC_PATH,
          `${path.dirname(asset.target)}/_tmp.webp`
        ),
        path.resolve(CLIENT_PUBLIC_PATH, asset.target)
      );
    }
    console.log(`Completed ${asset.name}!`);
    await delay(500);
  }
}

async function downloadShopAssets() {
  const categoryConfig = JSON.parse(
    await fs.readFile(path.resolve(SHOP_CONFIG_PATH, 'config.json'))
  );
  const allItems = (
    await Promise.all(
      categoryConfig.subCategories.map(async (subCategory) => {
        const items = JSON.parse(
          await fs.readFile(
            path.resolve(SHOP_CONFIG_PATH, subCategory, `items.json`)
          )
        );
        return items;
      })
    )
  ).reduce((acc, val) => acc.concat(val), []);
  for await (const item of allItems) {
    const { clothId } = item.meta;
    await generateCloth(clothId, false, {
      paper: item.subCategory === 'color',
      asset: item.subCategory === 'color',
    });
  }
}
await downloadBaseAssets();
process.chdir(path.resolve(process.cwd(), 'src/client'));
await downloadShopAssets();

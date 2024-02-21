import fs from 'fs/promises';
const DEFAULT_ITEM_CONFIG = {
  id: 'avatar:0009',
  label: 'AVATAR_0009',
  description: 'AVATAR_0009_DESC',
  price: 50,
  meta: {},
  listingMeta: {
    previewUrl: '{ASSET_PATH}/tile0009.webp',
    css: {
      borderRadius: 'sm',
    },
  },
  flags: [],
};

const icons = [];
for (let i = 0; i <= 42; i++) {
  const id = i.toString().padStart(4, '0');
  const item = {
    ...DEFAULT_ITEM_CONFIG,
    id: `avatar:${id}`,
    label: `Icon #${i}`,
    description: ``,
    listingMeta: {
      ...DEFAULT_ITEM_CONFIG.listingMeta,
      previewUrl: `{ASSET_PATH}/tile${id}.webp`,
    },
  };
  icons.push(item);
}
await fs.writeFile(
  './icons-items.json',
  JSON.stringify(icons, null, 2),
  'utf-8'
);

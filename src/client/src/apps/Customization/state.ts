import publicPath from '@utils/public';
import { atom, selectorFamily } from 'recoil';

export type InventoryCategory =
  | 'head'
  | 'face'
  | 'neck'
  | 'body'
  | 'hand'
  | 'feet'
  | 'color';

export interface IInventory {
  bought: Record<InventoryCategory, number[]>;
  selected: Record<InventoryCategory, number>;
}

export const inventoryAtom = atom<IInventory>({
  key: 'customization/inventory',
  default: {
    bought: {
      head: [1397, 401, 490, 497, 1277, 1950, 1968, 1970, 1973, 1998, 21012],
      face: [110, 138, 139],
      neck: [195, 168, 194, 316],
      body: [258, 205, 212, 231, 4572, 35130],
      hand: [321, 343, 220, 321, 5210],
      feet: [374, 383, 6006],
      color: [1, 11, 13, 16, 2, 3, 5, 7, 9, 10, 12, 15, 18, 20, 4, 6, 8],
    },
    selected: {
      head: 1397,
      face: 110,
      neck: 168,
      body: 258,
      hand: 343,
      feet: 374,
      color: 6,
    },
  },
});

export const inventoryBoughtCategoryItems = selectorFamily<
  number[],
  InventoryCategory
>({
  key: 'customization/bought/items',
  get:
    (category) =>
    ({ get }) => {
      const inventory = get(inventoryAtom);
      return inventory.bought[category];
    },
});

export const penguinClothingPriority = {
  face: 0,
  head: 1,
  feet: 2,
  body: 3,
  neck: 4,
  hand: 5,
  color: -1,
};

export const penguinColorPalette = {
  '1': 0x003366,
  '11': 0x006600,
  '13': 0x8ae302,
  '16': 0xf0f0d8,
  '2': 0x009900,
  '3': 0xff3399,
  '5': 0xcc0000,
  '7': 0xffcc00,
  '9': 0x996600,
  '10': 0xff6666,
  '12': 0x0099cc,
  '15': 0x02a797,
  '18': 0xbb85ab,
  '20': 0x2e47aa,
  '4': 0x333333,
  '6': 0xff6600,
  '8': 0x660099,
};

export const getClothIcon = (clothId: number) =>
  publicPath(`/penguin/clothing/${clothId}/icon.webp`);

import publicPath from '@utils/public';
import { atom, selector, selectorFamily } from 'recoil';

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
      neck: [195, 168, 194, 316, 3041, 3186],
      body: [258, 205, 212, 231, 4572, 35130],
      hand: [321, 343, 220, 321, 5210, 5415, 5428, 5004],
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

export const backClothingItemsAtom = atom<number[]>({
  key: 'customization/back/clothing',
  default: selector<number[]>({
    key: 'customization/back/clothing/default',
    get: async () => {
      return fetch(publicPath('/penguin/paper/back_clothing.json')).then((r) =>
        r.json()
      );
    },
  }),
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

export const getClothIcon = (clothId: number) =>
  publicPath(`/penguin/clothing/${clothId}/icon.webp`);

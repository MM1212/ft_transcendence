import { atom } from "recoil";

export type InventoryCategories =
  | "head"
  | "face"
  | "neck"
  | "body"
  | "hand"
  | "feet"
  | "color";

export interface IInventory {
  bought: Record<InventoryCategories, number[]>;
  selected: Record<InventoryCategories, number>;
}

export const inventoryAtom = atom<IInventory>({
  key: "inventory",
  default: {
    bought: {
      head: [],
      face: [],
      neck: [],
      body: [258],
      hand: [],
      feet: [],
      color: [1],
    },
    selected: {
      head: 1397,
      face: 110,
      neck: 195,
      body: 258,
      hand: 321,
      feet: 374,
      color: 6,
    },
  },
});

export const penguinClothingPriority = {
  face: 0,
  head: 1,
  feet: 2,
  body: 3,
  neck: 4,
  hand: 5,
  color: -1
}

export const penguinColorPalette = {
  "1": 0x003366,
  "11": 0x006600,
  "13": 0x8AE302,
  "16": 0xF0F0D8,
  "2": 0x009900,
  "3": 0xFF3399,
  "5": 0xCC0000,
  "7": 0xFFCC00,
  "9": 0x996600,
  "10": 0xFF6666,
  "12": 0x0099CC,
  "15": 0x02A797,
  "18": 0xBB85AB,
  "20": 0x2E47AA,
  "4": 0x333333,
  "6": 0xFF6600,
  "8": 0x660099,
};

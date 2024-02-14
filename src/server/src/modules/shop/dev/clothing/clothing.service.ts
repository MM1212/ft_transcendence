import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs/promises';
import { ShopService } from '../../shop.service';


export interface ClothingItem {
  id: number;
  name: string;
  props: {
    paper: boolean;
    icon: boolean;
    sprites: boolean;
    in_cdn: number | false;
  };
  in_shop: boolean;
  shop?: {
    description: string;
    price: number;
    subCategory: string;
  };
}

const CONFIG_FILE_PATH = path.resolve(
  process.cwd(),
  '..',
  'client/public/assets/penguin/dev/clothing-items.json',
);

@Injectable()
export class DevClothingListService {
  private readonly cache: Map<number, ClothingItem> = new Map();
  constructor(private readonly shopService: ShopService) {
    this.loadConfigFile();
  }

  private async loadConfigFile() {
    const raw = await fs.readFile(CONFIG_FILE_PATH, 'utf-8');
    const data = JSON.parse(raw) as Omit<ClothingItem, 'in_shop' | 'shop'>[];
    for await (const entry of data) {
      const shopItem = await this.shopService.getItem(`cloth:${entry.id}`);

      this.cache.set(entry.id, {
        ...entry,
        in_shop: !!shopItem,
      });
      if (shopItem) {
        const item = this.cache.get(entry.id)!;
        item.shop = {
          price: shopItem.price,
          description: shopItem.description,
          subCategory: shopItem.subCategory,
        };
      }
    }
  }

  public getList(): ClothingItem[] {
    return [...this.cache.values()];
  }
}

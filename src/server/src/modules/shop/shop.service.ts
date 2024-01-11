import { Injectable } from '@nestjs/common';
import { ShopConfigParser } from './shop.parser';
import ShopModel from '@typings/models/shop';

@Injectable()
export class ShopService {
  constructor(private readonly parser: ShopConfigParser) {}

  public async getInitialData(): Promise<ShopModel.DTO.GetInitialData> {
    await this.parser.waitUntilLoaded();
    return {
      categories: Object.values(this.parser.config.categories),
      subCategories: Object.keys(this.parser.config.subCategories).reduce(
        (acc, sub) => ({
          ...acc,
          [sub]: { ...this.parser.config.subCategories[sub], items: [] },
        }),
        {},
      ),
    };
  }
  public async getCategories(): Promise<ShopModel.Models.Category[]> {
    await this.parser.waitUntilLoaded();
    return Object.values(this.parser.config.categories);
  }
  public async getSubCategories(
    categoryId: string,
  ): Promise<ShopModel.Models.SubCategory[]> {
    await this.parser.waitUntilLoaded();
    const category = this.parser.config.categories[categoryId];
    if (!category) return [];
    return category.subCategories.map(
      (subCategoryId) => this.parser.config.subCategories[subCategoryId],
    );
  }
  public async getItems(
    categoryId: string,
    subCategoryId: string,
  ): Promise<ShopModel.Models.Item[]> {
    await this.parser.waitUntilLoaded();
    const subCategory = this.parser.config.subCategories[subCategoryId];
    if (!subCategory) return [];
    if (subCategory.category !== categoryId) return [];
    return subCategory.items.map((itemId) => this.parser.config.items[itemId]);
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShopConfigParser } from './shop.parser';
import ShopModel from '@typings/models/shop';
import User from '../users/user';
import InventoryModel from '@typings/models/users/inventory';

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

  public async createItem(
    id: string,
  ): Promise<Omit<InventoryModel.Models.IItem, 'id' | 'createdAt' | 'userId'>> {
    await this.parser.waitUntilLoaded();
    const config = this.parser.config.items[id];
    if (!config) throw new Error('Item not found: ' + id);
    return {
      type: `${config.category}-${config.subCategory}`,
      name: config.id,
      meta: config.meta,
    };
  }

  public async buyItem(
    user: User,
    itemId: string,
  ): Promise<InventoryModel.Models.IItem> {
    const itemConfig = this.parser.config.items[itemId];
    if (!itemConfig) throw new NotFoundException('Item not found');
    if (user.inventory.getByName(itemId))
      throw new ForbiddenException('You already own this item');
    if (user.credits.value < itemConfig.price)
      throw new ForbiddenException('You do not have enough credits');
    await user.credits.remove(itemConfig.price);
    const item = await user.inventory.add(
      `${itemConfig.category}-${itemConfig.subCategory}`,
      itemConfig.id,
      itemConfig.meta,
      false,
    );
    return item;
  }
}
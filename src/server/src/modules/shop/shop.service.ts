import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ShopConfigParser } from './shop.parser';
import ShopModel from '@typings/models/shop';
import User from '../users/user';
import InventoryModel from '@typings/models/users/inventory';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ShopService {
  constructor(
    public readonly parser: ShopConfigParser,
    public readonly events: EventEmitter2,
  ) {}

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
  public async getItem(id: string): Promise<ShopModel.Models.Item | null> {
    await this.parser.waitUntilLoaded();
    return this.parser.config.items[id] ?? null;
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
    this.hasAllItems(user);
    await this.events.emitAsync(ShopModel.DTO.Events.OnItemBought, user, item);
    return item;
  }

  private async hasAllItems(user: User): Promise<boolean> {
    const itemData = this.parser.config.items;
    for (const item in itemData) {
      if (!user.inventory.getByName(item)) {
        return false;
      }
    }
    const achievement = await user.achievements.get<{ count: number }>(
      'store:buy:all',
    );
    if (achievement.completed) return false;
    await achievement.update((previous) => ({
      ...previous,
      count: 1,
    }));
    return true;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import mainConfigFile from '@/assets/shop/config.json';
import ShopModel from '@typings/models/shop';
import fs from 'fs/promises';
import path from 'path';

@Injectable()
export class ShopConfigParser {
  private rawConfig: ShopModel.Models.Config.Shop = [...mainConfigFile];
  public loaded: boolean = false;
  private waitingPromises: Array<() => void> = [];
  private readonly configPath: string = 'dist/assets/shop';
  public readonly config: ShopModel.Models.Shop = {
    categories: {},
    subCategories: {},
    items: {},
  };
  private readonly logger: Logger = new Logger(ShopConfigParser.name);
  constructor() {
    this.parseConfig();
  }

  private setupEnv(
    lookup: unknown,
    prevEnv: Record<string, string> = {},
  ): void {
    if (typeof lookup !== 'object') return;
    Object.entries(lookup as object).forEach(([key, value]) => {
      if (typeof value === 'object') {
        if (Array.isArray(value))
          value.forEach((v) => {
            this.setupEnv(v as Record<string, unknown>, prevEnv);
          });
        else
          Object.assign(
            (lookup as Record<string, unknown>)[key] as Record<string, unknown>,
            this.setupEnv(value as Record<string, unknown>, prevEnv),
          );
      } else if (typeof value === 'string') {
        (lookup as Record<string, unknown>)[key] = value.replace(
          /{(.*)}/g,
          (_, p1) => {
            return prevEnv[p1] || '';
          },
        );
      }
    });
  }
  private async parseConfig() {
    for await (const category of this.rawConfig) {
      const categoryConfig = await this.parseCategory(category);
      if (!categoryConfig) continue;
      // this.config.categories.push(categoryConfig);
      this.config.categories[category] = categoryConfig;
    }
    this.loaded = true;
    this.resolveWaitingPromises();
    // console.log(this.config);
    // Object.values(this.config.categories).forEach((category) => {
    //   category.subCategories.forEach((subCategory) => {
    //     console.log(this.config.subCategories[subCategory]);
    //     console.log(this.config.subCategories[subCategory].items.map((item) => this.config.items[item]));
    //   });
    // });
  }
  private async parseCategory(
    category: string,
  ): Promise<ShopModel.Models.Category | undefined> {
    let env: Record<string, string> = {};
    try {
      const config = JSON.parse(
        await fs.readFile(
          path.resolve(this.configPath, category, 'config.json'),
          'utf-8',
        ),
      ) as ShopModel.Models.Config.Category | null;
      if (!config)
        throw new Error(
          `Error while parsing category ${category}: config.json is invalid`,
        );
      env = { ...env, ...config.env };
      this.setupEnv(config as unknown as Record<string, unknown>, env);
      env = { ...env, ...config.env };
      const subCategories: string[] = [];
      for await (const subCategory of config.subCategories) {
        const subCategoryConfig = await this.parseSubCategory(
          category,
          subCategory,
          env,
        );
        if (!subCategoryConfig) continue;
        subCategories.push(subCategory);
        this.config.subCategories[subCategory] = subCategoryConfig;
      }
      return {
        id: category,
        label: config.label,
        icon: config.icon,
        subCategories,
      } satisfies ShopModel.Models.Category;
    } catch (e) {
      this.logger.error(`Error while parsing category ${category}`, e);
      return undefined;
    }
  }
  private async parseSubCategory(
    category: string,
    subCategory: string,
    env: Record<string, string> = {},
  ): Promise<ShopModel.Models.SubCategory | undefined> {
    try {
      const config = JSON.parse(
        await fs.readFile(
          path.resolve(this.configPath, category, subCategory, 'config.json'),
          'utf-8',
        ),
      ) as ShopModel.Models.Config.SubCategory | null;
      if (!config)
        throw new Error(
          `Error while parsing subCategory ${subCategory}: config.json is invalid`,
        );
      this.setupEnv(config as unknown as Record<string, unknown>, env);
      env = { ...env, ...config.env };
      const items = JSON.parse(
        await fs.readFile(
          path.resolve(this.configPath, category, subCategory, 'items.json'),
          'utf-8',
        ),
      ) as ShopModel.Models.Item[] | null;
      if (!items)
        throw new Error(
          `Error while parsing subCategory ${subCategory}: items.json is invalid`,
        );
      items.forEach((item) => {
        this.setupEnv(item as unknown as Record<string, unknown>, env);
        item.category = category;
        item.subCategory = subCategory;
        this.config.items[item.id] = item;
      });
      return {
        id: subCategory,
        category,
        label: config.label,
        icon: config.icon,
        items: items.map((item) => item.id),
      } satisfies ShopModel.Models.SubCategory;
    } catch (e) {
      this.logger.error(`Error while parsing subCategory ${subCategory}`, e);
      return undefined;
    }
  }

  public async waitUntilLoaded(): Promise<void> {
    if (this.loaded) return;
    return new Promise((resolve) => {
      this.waitingPromises.push(resolve);
    });
  }
  private resolveWaitingPromises() {
    this.waitingPromises.forEach((resolve) => resolve());
    this.waitingPromises = [];
  }
}

namespace ShopModel {
  export namespace Models {
    export enum CategoryType {
      Clothes = 'CLOTHES',
      Pong = 'PONG',
    }
    export enum ItemFlags {
      Hidden = 'HIDDEN', // hidden from shop
      LockedByQuests = 'LOCKED_BY_QUESTS', // locked by quests in meta
      LockedByLevel = 'LOCKED_BY_LEVEL', // locked by level in meta
      LockedChangePrice = 'LOCKED_CHANGE_PRICE', // if locked by quests or level, price is 0 or defined in meta
    }
    export interface SubCategories extends Record<CategoryType, string[]> {
      [CategoryType.Clothes]: [];
      [CategoryType.Pong]: [];
    }
    export interface Item {
      id: string; // composed of parent + sub1 + sub2 + sub3 + subn + id in cfg
      label: string;
      description: string;
      price: number;
      category: CategoryType;
      subCategory: SubCategories[CategoryType];
      meta: Record<string, unknown>;
      flags: ItemFlags[];
    }
    export interface SubCategory {
      id: string;
      label: string;
      items: Item[];
    }
    export interface Category {
      id: string;
      label: string;
      subCategories: SubCategory[];
    }
    export interface Shop {
      categories: Category[];
    }
  }
  export namespace DTO {}
  export namespace Endpoints {}
}

export default ShopModel;

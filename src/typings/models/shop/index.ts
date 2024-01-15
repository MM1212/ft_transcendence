import {
  Endpoint,
  EndpointMethods,
  GetEndpoint,
  GroupEndpointTargets,
} from '@typings/api';
import InventoryModel from '../users/inventory';

namespace ShopModel {
  export namespace Models {
    export enum ItemType {
      Normal,
      Bundle,
    }
    export enum ItemFlags {
      Hidden = 'HIDDEN', // hidden from shop
      LockedByQuests = 'LOCKED_BY_QUESTS', // locked by quests in meta
      LockedByLevel = 'LOCKED_BY_LEVEL', // locked by level in meta
      LockedChangePrice = 'LOCKED_CHANGE_PRICE', // if locked by quests or level, price is 0 or defined in meta
    }
    export type ListingMetadata<
      T extends Record<string, unknown> = Record<string, unknown>
    > = T & {
      previewUrl: string;
      css?: Record<any, any>;
    };
    export interface Item {
      id: string; // composed of parent + sub1 + sub2 + sub3 + subn + id in cfg
      type: ItemType;
      label: string;
      description: string;
      price: number;
      category: string;
      subCategory: string;
      meta: Record<string, unknown>;
      listingMeta: ListingMetadata;
      flags: ItemFlags[];
    }
    export interface SubCategory {
      id: string;
      category: string;
      label: string;
      icon: string;
      Icon?: any;
      items: string[];
    }
    export interface Category {
      id: string;
      label: string;
      icon: string;
      Icon?: any;
      subCategories: string[];
    }
    export interface Shop {
      categories: Record<string, Category>;
      subCategories: Record<string, SubCategory>;
      items: Record<string, Item>;
    }

    export namespace Config {
      export type SubCategoryItems = Models.Item[];
      export interface SubCategory extends Omit<Models.SubCategory, 'items'> {
        env: Record<string, string>;
      }
      export interface Category extends Omit<Models.Category, 'subCategories'> {
        subCategories: string[];
        env: Record<string, string>;
      }
      export type Shop = string[];
    }
  }
  export namespace DTO {
    export interface GetInitialData {
      categories: Models.Category[];
      subCategories: Record<string, Models.SubCategory>;
    }

    export interface GetItemsParams extends Record<string, unknown> {
      page?: number;
      limit?: number;
      category: string;
      sub_category: string;
    }

    export interface BuyItemParams extends Record<string, unknown> {
      item_id: string;
    }
  }
  export namespace Endpoints {
    export enum Targets {
      GetInitialData = '/shop',
      GetItems = '/shop/:category/:sub_category/items',
      BuyItem = '/shop/buy/:item_id',
    }
    export type All = GroupEndpointTargets<Targets>;

    export interface GetInitialData
      extends GetEndpoint<Targets.GetInitialData, DTO.GetInitialData> {}
    export interface GetItems
      extends GetEndpoint<
        Targets.GetItems,
        Models.Item[],
        DTO.GetItemsParams
      > {}

    export interface BuyItem
      extends Endpoint<
        EndpointMethods.Post,
        Targets.BuyItem,
        InventoryModel.Models.IItem,
        undefined,
        DTO.BuyItemParams
      > {}

    export interface Registry {
      [EndpointMethods.Get]: {
        [Targets.GetInitialData]: GetInitialData;
        [Targets.GetItems]: GetItems;
      };
      [EndpointMethods.Post]: {
        [Targets.BuyItem]: BuyItem;
      };
    }
  }
}

export default ShopModel;

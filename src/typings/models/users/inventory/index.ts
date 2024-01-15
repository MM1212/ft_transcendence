import { EndpointMethods, GetEndpoint, GroupEndpointTargets, SseModel } from '@typings/api';

namespace InventoryModel {
  export namespace Models {
    export interface IItem<
      T extends Record<string, unknown> = Record<string, unknown>
    > {
      id: number;
      type: string;
      name: string;
      meta: T;
      createdAt: number;
      userId: number;
    }
  }
  export namespace DTO {
    export namespace DB {
      export interface IItem extends Omit<Models.IItem, 'createdAt' | 'meta'> {
        createdAt: Date;
        meta: any;
      }

      export interface CreateItem extends Omit<IItem, 'id' | 'createdAt'> {}
    }
  }

  export namespace Endpoints {
    export enum Targets {
      GetSessionInventory = '/me/inventory',
    }
    export type All = GroupEndpointTargets<Targets>;

    export interface GetSessionInventory
      extends GetEndpoint<Targets.GetSessionInventory, Models.IItem[]> {}

    export interface Registry {
      [EndpointMethods.Get]: {
        [Targets.GetSessionInventory]: GetSessionInventory;
      }
    }
  }
  export namespace Sse {
    export enum Events {
      UpdateInventory = 'users.inventory.update',
    }

    export interface UpdateInventoryEvent
      extends SseModel.Models.Event<Models.IItem[], Events.UpdateInventory> {}
  }
}

export default InventoryModel;

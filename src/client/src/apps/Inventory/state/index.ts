import tunnel from '@lib/tunnel';
import InventoryModel from '@typings/models/users/inventory';
import { atom, selector, selectorFamily } from 'recoil';

const inventoryState = new (class InventoryState {
  inventory = atom<InventoryModel.Models.IItem[]>({
    key: 'inventory',
    default: selector<InventoryModel.Models.IItem[]>({
      key: 'inventory/default',
      get: async () => {
        try {
          return await tunnel.get(
            InventoryModel.Endpoints.Targets.GetSessionInventory
          );
        } catch (e) {
          console.warn(e);
          return [];
        }
      },
    }),
  });
  inventoryByType = selectorFamily<InventoryModel.Models.IItem[], string>({
    key: 'inventory/byType',
    cachePolicy_UNSTABLE: {
      eviction: 'most-recent',
    },
    get:
      (type) =>
      async ({ get }) => {
        const inventory = get(this.inventory);
        return inventory.filter((item) => item.type === type);
      },
  });
})();

export default inventoryState;

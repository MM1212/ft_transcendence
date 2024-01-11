import tunnel from '@lib/tunnel';
import InventoryModel from '@typings/models/users/inventory';
import { atom, selector } from 'recoil';

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
})();

export default inventoryState;

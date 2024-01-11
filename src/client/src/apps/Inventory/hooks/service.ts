import InventoryModel from '@typings/models/users/inventory';
import { useRecoilCallback } from 'recoil';
import inventoryState from '../state';
import { useSseEvent } from '@hooks/sse';

export const useInventoryService = () => {
  const onInventoryUpdate = useRecoilCallback(
    (ctx) => async (ev: InventoryModel.Sse.UpdateInventoryEvent) => {
      ctx.set(inventoryState.inventory, ev.data);
    },
    []
  );

  useSseEvent<InventoryModel.Sse.UpdateInventoryEvent>(
    InventoryModel.Sse.Events.UpdateInventory,
    onInventoryUpdate
  );
};

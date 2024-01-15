import inventoryState from '@apps/Inventory/state';
import { useConfirmationModalActions } from '@apps/Modals/Confirmation/hooks';
import ShoppingIcon from '@components/icons/ShoppingIcon';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import ShopModel from '@typings/models/shop';
import React from 'react';
import { useRecoilCallback } from 'recoil';

export const useShopActions = () => {
  const { confirm } = useConfirmationModalActions();
  const [loading, setLoading] = React.useState(false);
  const buyItem = useRecoilCallback(
    (ctx) => async (itemId: string, ) => {
      const confirmed = await confirm({
        content: `
        Are you sure you want to buy this item?
    `,
        confirmText: 'Purchase',
        confirmColor: 'success',
        headerIcon: ShoppingIcon,
      });
      if (!confirmed) return;
      try {
        setLoading(true);
        const item = await tunnel.post(ShopModel.Endpoints.Targets.BuyItem, undefined, {
          item_id: itemId,
        });
        notifications.success('Item purchased', `You have purchased ${item.name}`);
        ctx.set(inventoryState.inventory, (prev) => [...prev, item]);
      } catch (e) {
        notifications.error('Failed to buy item', (e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [confirm]
  );
  return { buyItem, loading };
};

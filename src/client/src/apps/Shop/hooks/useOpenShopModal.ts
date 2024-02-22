import { useModal, useModalActions } from '@hooks/useModal';

export interface ShopOpenModal {
}

export const SHOP_OPEN_MODAL_ID = 'shop:open';

export const useOpenShopModal = () =>
  useModal<ShopOpenModal>(SHOP_OPEN_MODAL_ID);

export const useOpenShopModalActions = () =>
  useModalActions<ShopOpenModal>(SHOP_OPEN_MODAL_ID);

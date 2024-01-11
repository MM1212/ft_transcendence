import { Modal, ModalDialog, Sheet, Typography } from '@mui/joy';
import ShopTabs from '../components/ShopTabs';
import { useOpenShopModal } from '../hooks/useOpenShopModal';
import React from 'react';

export default function ShopView() {
  const { close, isOpened, data } = useOpenShopModal();
  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog
        sx={{
          width: '87dvh',
          height: '60dvh',
          borderLeft: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          p: 0,
        }}
      >
        <React.Suspense>
          <ShopTabs></ShopTabs>
        </React.Suspense>
      </ModalDialog>
    </Modal>
  );
}

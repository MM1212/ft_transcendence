import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import { Box, Sheet } from '@mui/joy';
import { useModal } from '@hooks/useModal';
import publicPath from '@utils/public';

export default function ProfilePictureModal() {
  const { isOpened, close, data, setData } = useModal<{ avatar: string }>(
    'profile:change-avatar'
  );
  const assetArray = React.useMemo(
    () => Array.from({ length: 43 }).map((_, i) => i),
    []
  );
  const selectAsset = (assetId: number) => {
    setData({ avatar: assetId.toString() });
    close();
  };

  return (
    <React.Fragment>
      <Modal open={isOpened} onClose={close}>
        <ModalDialog minWidth="md">
          <ModalClose />
          <DialogTitle>Avatar Picker</DialogTitle>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              flexWrap: 'wrap',
              overflowY: 'auto',
              gap: 1,
            }}
          >
            {assetArray.map((asset, index) => (
              <Sheet
                variant="outlined"
                color="neutral"
                key={index}
                onClick={() => selectAsset(asset)}
                sx={{
                  flex: '1 0 15.7%',
                  aspectRatio: '1/1',
                  p: 0,
                  borderRadius: 'xl',
                  overflow: 'hidden',
                  flexGrow: 0,
                  backgroundImage: `url(${publicPath(
                    `/profile/tile${asset.toString().padStart(4, '0')}.webp`
                  )})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  opacity: data.avatar === asset.toString() ? 0.5 : 1,
                  transition: (theme) => theme.transitions.create('opacity'),
                  '&:hover': {
                    opacity: 0.8,
                    cursor: 'pointer',
                  },
                }}
              />
            ))}
          </Box>
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
}

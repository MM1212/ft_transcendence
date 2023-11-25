import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import { Box, Sheet } from '@mui/joy';
import publicPath from '@utils/public';
import { useSelectUserAvatar } from '../hooks/useUpdateAvatarModal';

export default function ProfilePictureModal() {
  const {
    isOpened,
    close,
    data: { onSubmit, ...data },
    setData,
  } = useSelectUserAvatar();
  const assetArray = React.useMemo(
    () => Array.from({ length: 43 }).map((_, i) => i),
    []
  );
  const selectAsset = (assetId: number) => {
    setData({ avatar: assetId.toString() });
    onSubmit?.(assetId.toString());
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
            {assetArray.map((asset, index) => {
              const selected = data.avatar === asset.toString();
              return (
                <Sheet
                  variant="outlined"
                  color={selected ? 'warning' : 'neutral'}
                  key={index}
                  onClick={() => selectAsset(asset)}
                  sx={{
                    flex: '1 0 15dvh',
                    aspectRatio: '1/1',
                    p: 0,
                    borderRadius: 'xl',
                    borderWidth: '.3dvh',
                    borderColor: (theme) =>
                      theme.palette[selected ? 'warning' : 'neutral'][400],
                    boxShadow: (theme) => theme.shadow.xl,
                    overflow: 'hidden',
                    flexGrow: 0,
                    backgroundImage: `url(${publicPath(
                      `/profile/tile${asset.toString().padStart(4, '0')}.webp`
                    )})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: selected ? 1 : 0.5,
                    transition: (theme) => theme.transitions.create('opacity'),
                    WebkitBackfaceVisibility: 'hidden',
                    '&:hover': {
                      cursor: 'pointer',
                      opacity: 0.8,
                    },
                  }}
                  title="Selecting closes the dialog"
                />
              );
            })}
          </Box>
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
}

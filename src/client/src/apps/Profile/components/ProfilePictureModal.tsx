import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import { Box, CircularProgress, Sheet, styled } from '@mui/joy';
import publicPath from '@utils/public';
import { useSelectUserAvatar } from '../hooks/useUpdateAvatarModal';
import { useInventoryByType } from '@apps/Inventory/hooks/useInventory';

const AvatarDisplay = styled(Sheet, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ selected, theme }) => ({
  flex: '1 0 15dvh',
  aspectRatio: '1/1',
  padding: 0,
  borderRadius: theme.radius.lg,
  borderWidth: '.3dvh',
  borderColor: theme.palette[selected ? 'warning' : 'neutral'][400],
  boxShadow: theme.shadow.xl,
  overflow: 'hidden',
  flexGrow: 0,
  opacity: selected ? 1 : 0.5,
  transition: theme.transitions.create('opacity'),
  WebkitBackfaceVisibility: 'hidden',
  '&:hover': {
    cursor: 'pointer',
    opacity: 0.8,
  },
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

function RenderAssets(): JSX.Element {
  const {
    close,
    data: { onSubmit, ...data },
    setData,
  } = useSelectUserAvatar();
  const assets = useInventoryByType('user-icons');
  const selectAsset = (assetId: number) => {
    setData({ avatar: assetId.toString() });
    onSubmit?.(assetId.toString());
    close();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        flexWrap: 'wrap',
        overflowY: 'auto',
        gap: 1,
      }}
    >
      {assets.map((item, index) => {
        const [, id] = item.name.split(':');
        const assetId = parseInt(id)!;
        const selected = data.avatar === assetId.toString();
        return (
          <AvatarDisplay
            variant="outlined"
            color={selected ? 'warning' : 'neutral'}
            selected={selected}
            key={index}
            onClick={() => selectAsset(assetId)}
            title="Selecting closes the dialog"
          >
            <img
              src={publicPath(`/profile/tile${id}.webp`)}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </AvatarDisplay>
        );
      })}
    </Box>
  );
}

export default function ProfilePictureModal() {
  const { isOpened } = useSelectUserAvatar();

  return (
    <React.Fragment>
      <Modal open={isOpened} onClose={close}>
        <ModalDialog minWidth="xs" maxWidth="md">
          <ModalClose />
          <DialogTitle>Avatar Picker</DialogTitle>
          <React.Suspense fallback={<CircularProgress />}>
            <RenderAssets />
          </React.Suspense>
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
}

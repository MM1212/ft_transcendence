import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import Stack from '@mui/joy/Stack';
import CustomizationBox from '@apps/Customization/components/CustomizationBox';
import { Box } from '@mui/joy';
import { useModal } from '@hooks/useModal';
import { useRecoilCallback } from 'recoil';
import tunnel from '@lib/tunnel';
import UsersModel from '@typings/models/users';
import { sessionAtom } from '@hooks/user';
import { mutate } from 'swr';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { AuthModel } from '@typings/models';
import notifications from '@lib/notifications/hooks';

export default function ProfilePictureModal() {
  const { isOpened, close } = useModal('profile:change-avatar');
  const assetArray = React.useMemo(
    () =>
      Array.from({ length: 42 }).map(
        (_, i) => `/profile/tile${(i + 1).toString().padStart(4, '0')}.png`
      ),
    []
  );

  const updateAvatar = useRecoilCallback(
    (ctx) => async (avatarSrc: string) => {
      const user = await ctx.snapshot.getPromise(sessionAtom);
      if (!user) return;
      try {
        await tunnel.patch(
          UsersModel.Endpoints.Targets.PatchUser,
          {
            avatar: avatarSrc,
          },
          {
            id: user.id,
          }
        );
        mutate(
          buildTunnelEndpoint(AuthModel.Endpoints.Targets.Session),
          undefined,
          {
            revalidate: true,
          }
        );
        close();
        notifications.success('User updated!');
      } catch (error) {
        notifications.error('Could not update user', (error as Error).message);
      }
    },
    [close]
  );

  return (
    <React.Fragment>
      <Modal open={isOpened} onClose={close}>
        <ModalDialog>
          <ModalClose />
          <DialogTitle>Avatar Picker</DialogTitle>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              flexWrap: 'wrap',
              overflowY: 'auto',
              flexGrow: 1,
              gap: 1,
            }}
          >
            {assetArray.map((asset, index) => (
              <CustomizationBox
                key={index}
                onClick={() => updateAvatar(asset)}
                imageUrl={asset}
                flex="1 0 15.7%"
                imgProps={{
                  padding: 0,
                  borderRadius: 'xl',
                  overflow: 'hidden',
                  flexGrow: 0,
                }}
              />
            ))}
          </Box>
        </ModalDialog>
      </Modal>
    </React.Fragment>
  );
}

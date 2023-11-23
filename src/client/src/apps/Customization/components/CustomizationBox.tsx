import { buildTunnelEndpoint } from '@hooks/tunnel';
import { useCurrentUser } from '@hooks/user';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import { Sheet } from '@mui/joy';
import { SxProps } from '@mui/joy/styles/types';
import { AuthModel } from '@typings/models';
import UsersModel from '@typings/models/users';
import React from 'react';
import { mutate } from 'swr';

export default function CustomizationBox({
  flex = 1,
  onClick,
  imageUrl,
  selected,
  children,
  disabled = false,
  imgProps,
}: {
  disabled?: boolean;
  imageUrl?: string;
  selected?: boolean;
  flex?: React.CSSProperties['flex'];
  onClick?: () => void;
  children?: React.ReactNode;
  imgProps?: SxProps;
}) {
  const user = useCurrentUser();
  const [loading, setLoading] = React.useState(false);
  const submitProperties = React.useCallback(
    async (avatar: string) => {
      if (!user) return;
      try {
        setLoading(true);
        await tunnel.patch(
          UsersModel.Endpoints.Targets.PatchUser,
          {
            avatar,
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
        notifications.success('User updated!');
      } catch (error) {
        notifications.error('Could not update user', (error as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return (
    <Sheet
      variant="outlined"
      sx={{
        p: 1,
        aspectRatio: '1/1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: !disabled ? 'pointer' : undefined,
        bgcolor: selected && !disabled ? 'background.level2' : undefined,
        borderRadius: (theme) => theme.radius.sm,
        transition: (theme) => theme.transitions.create('background-color'),
        '&:hover': !disabled
          ? {
              bgcolor: 'background.level1',
            }
          : undefined,
        flex,
        overflow: 'hidden',
        ...imgProps,
      }}
      onClick={onClick}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'scale-down',
          }}
        />
      ) : (
        children
      )}
    </Sheet>
  );
}

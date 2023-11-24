import {
  Button,
  ColorPaletteProp,
  DialogActions,
  FormLabel,
  Input,
  Option,
  Select,
  Typography,
} from '@mui/joy';
import {
  DialogContent,
  DialogTitle,
  FormControl,
  Modal,
  ModalDialog,
  Stack,
} from '@mui/joy';
import React, { memo } from 'react';
import { mutate } from 'swr';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import tunnel from '@lib/tunnel';
import UsersModel from '@typings/models/users';
import { AuthModel } from '@typings/models';
import CircleIcon from '../../../components/icons/CircleIcon';
import notifications from '@lib/notifications/hooks';
import { useCurrentUser } from '@hooks/user';
import { UserAvatar } from '../../../components/AvatarWithStatus';
import ProfilePictureModal from './ProfilePictureModal';
import { useUpdateUserModal } from '../hooks/useUpdateUserModal';
import { useSelectUserAvatarActions } from '../hooks/useUpdateAvatarModal';

type IUser = UsersModel.Models.IUserInfo;
type State = Pick<IUser, 'avatar' | 'nickname' | 'status'>;

const statusOptions = [
  { color: 'success', label: 'Online', value: UsersModel.Models.Status.Online },
  { color: 'warning', label: 'Away', value: UsersModel.Models.Status.Away },
  { color: 'danger', label: 'Busy', value: UsersModel.Models.Status.Busy },
  {
    color: 'neutral',
    label: 'Offline',
    value: UsersModel.Models.Status.Offline,
  },
] as {
  color: ColorPaletteProp;
  label: string;
  value: UsersModel.Models.Status;
}[];

const StatusIndicator = memo(function StatusIndicator({
  label,
  color,
}: (typeof statusOptions)[number]): JSX.Element {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <CircleIcon size="xs" color={color} />
      <Typography>{label}</Typography>
    </Stack>
  );
});

export default function UpdateUserModal(): JSX.Element {
  const user = useCurrentUser();
  const [input, setInput] = React.useState<State>(user ?? ({} as State));
  const [loading, setLoading] = React.useState(false);
  const {
    close,
    isOpened,
    data: { map, header, body, dismissable, submitAnyway },
  } = useUpdateUserModal();

  const updateProperty = React.useCallback(
    <T extends keyof State>(key: T) =>
      (value: State[T]) => {
        setInput((prev) => ({ ...prev, [key]: value }));
      },
    []
  );
  const updateInputProperty = React.useCallback(
    <T extends keyof State>(key: T) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        updateProperty(key)(event.target.value as State[T]);
      },
    [updateProperty]
  );

  const submitProperties = React.useCallback(async () => {
    if (!user) return;
    const data = await Promise.resolve(
      map?.({
        avatar: input.avatar,
        nickname: input.nickname,
        status: input.status,
        id: user.id,
      }) ?? input
    );
    try {
      setLoading(true);
      await tunnel.patch(UsersModel.Endpoints.Targets.PatchUser, data, {
        id: user.id,
      });
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
    } finally {
      setLoading(false);
    }
  }, [user, map, input, close]);

  React.useEffect(() => {
    setInput(user ?? ({} as State));
  }, [user]);

  const propertiesUpdated = React.useMemo(() => {
    if (!user) return false;
    for (const key in input) {
      if (input[key as keyof State] !== user[key as keyof IUser]) return true;
    }
    return false;
  }, [input, user]);

  const { open: openAvatarModal } = useSelectUserAvatarActions();

  return (
    <>
      <Modal open={isOpened} onClose={close}>
        <ModalDialog>
          <DialogTitle>{header}</DialogTitle>
          <DialogContent>
            {body}
            <form
              onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                submitProperties();
              }}
            >
              <Stack spacing={1} >
                <FormControl>
                  <FormLabel>Nickname</FormLabel>
                  <Input
                    autoFocus
                    required
                    value={input.nickname}
                    onChange={updateInputProperty('nickname')}
                    error={!input.nickname}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Avatar</FormLabel>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      variant="outlined"
                      onClick={() =>
                        openAvatarModal({
                          avatar: input.avatar,
                          onSubmit: updateProperty('avatar'),
                        })
                      }
                      color="neutral"
                      sx={{
                        px: 1
                      }}
                      startDecorator={
                        <UserAvatar src={input.avatar} size="sm" variant="outlined" />
                      }
                    >
                      Select Avatar
                    </Button>
                  </Stack>
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={input.status}
                    onChange={(_, value) =>
                      updateProperty('status')(
                        value ?? UsersModel.Models.Status.Offline
                      )
                    }
                    sx={{
                      width: '50%',
                    }}
                  >
                    {statusOptions.map(({ color, label, value }) => (
                      <Option
                        value={value}
                        label={
                          <StatusIndicator
                            color={color}
                            label={label}
                            value={value}
                          />
                        }
                        key={value}
                      >
                        <StatusIndicator
                          color={color}
                          label={label}
                          value={value}
                        />
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </form>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={submitProperties}
              disabled={!propertiesUpdated && !submitAnyway}
              loading={loading}
            >
              Submit
            </Button>
            {dismissable && (
              <Button variant="plain" color="neutral" onClick={close}>
                Cancel
              </Button>
            )}
          </DialogActions>
        </ModalDialog>
      </Modal>
      <ProfilePictureModal />
    </>
  );
}

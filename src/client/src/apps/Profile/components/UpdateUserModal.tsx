import {
  Box,
  Button,
  ColorPaletteProp,
  DialogActions,
  FormLabel,
  Input,
  Option,
  Select,
  Typography,
  useColorScheme,
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
import UpdateUserTFA from './UpdateUserTFA';
import CogIcon from '@components/icons/CogIcon';
import WhiteBalanceSunnyIcon from '@components/icons/WhiteBalanceSunnyIcon';
import WeatherNightIcon from '@components/icons/WeatherNightIcon';

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

const OptionDecorator = memo(function OptionDecorator({
  label,
  icon,
}: {
  label: React.ReactNode;
  icon: React.ReactNode;
}): JSX.Element {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography level="body-md">{label}</Typography>
    </Stack>
  );
});

const StatusIndicator = memo(function StatusIndicator({
  label,
  color,
}: (typeof statusOptions)[number]): JSX.Element {
  return (
    <OptionDecorator
      label={label}
      icon={<CircleIcon color={color} size="xs" />}
    />
  );
});

const ColorSchemeToggle = memo(function ColorSchemeToggle(): JSX.Element {
  const { mode, setMode } = useColorScheme();
  return (
    <FormControl>
      <FormLabel>Color Scheme</FormLabel>
      <Select value={mode} onChange={(_, value) => value && setMode(value)}>
        <Option
          value="system"
          label={
            <OptionDecorator label="System" icon={<CogIcon size="sm" />} />
          }
        >
          <OptionDecorator label="System" icon={<CogIcon size="sm" />} />
        </Option>
        <Option
          value="light"
          label={
            <OptionDecorator
              label="Light"
              icon={<WhiteBalanceSunnyIcon size="sm" />}
            />
          }
        >
          <OptionDecorator
            label="Light"
            icon={<WhiteBalanceSunnyIcon size="sm" />}
          />
        </Option>
        <Option
          value="dark"
          label={
            <OptionDecorator
              label="Dark"
              icon={<WeatherNightIcon size="sm" />}
            />
          }
        >
          <OptionDecorator label="Dark" icon={<WeatherNightIcon size="sm" />} />
        </Option>
      </Select>
    </FormControl>
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
      notifications.success('Profile updated!');
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
  if (!user) return <></>;
  return (
    <>
      <Modal open={isOpened} onClose={close}>
        <ModalDialog>
          <DialogTitle>{header}</DialogTitle>
          <DialogContent
            style={{
              overflow: 'inherit',
            }}
          >
            {body}
            <form
              onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                submitProperties();
              }}
            >
              <Stack spacing={1} alignItems="flex-start">
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
                        px: 1,
                      }}
                      startDecorator={
                        <UserAvatar
                          src={input.avatar}
                          size="sm"
                          variant="outlined"
                        />
                      }
                    >
                      Select Avatar
                    </Button>
                  </Stack>
                </FormControl>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  width="100%"
                >
                  <FormControl>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={input.status}
                      onChange={(_, value) =>
                        updateProperty('status')(
                          value ?? UsersModel.Models.Status.Offline
                        )
                      }
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
                  <ColorSchemeToggle />
                </Box>
                <UpdateUserTFA {...user} />
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

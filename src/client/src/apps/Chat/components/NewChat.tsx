import React from 'react';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import Stack from '@mui/joy/Stack';
import { useModal } from '@hooks/useModal';
import { useForm } from '@mantine/form';
import ChatsModel from '@typings/models/chat';
import {
  AutocompleteOption,
  Avatar,
  Button,
  CircularProgress,
  DialogActions,
  FormHelperText,
  Option,
  Textarea,
  Tooltip,
  textareaClasses,
} from '@mui/joy';

export const urlRegex =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

import LinearProgress from '@mui/joy/LinearProgress';
import Typography from '@mui/joy/Typography';
import UsersModel from '@typings/models/users';
import { Autocomplete } from '@mui/joy';
import tunnel from '@lib/tunnel';
import Collapse from '@components/transitions/Collapse';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import chatsState from '@/apps/Chat/state';
import notifications from '@lib/notifications/hooks';
import FormTextboxPasswordIcon from '@components/icons/FormTextboxPasswordIcon';
import AccountGroupIcon from '@components/icons/AccountGroupIcon';
import LabelIcon from '@components/icons/LabelIcon';
import ImageIcon from '@components/icons/ImageIcon';
import LinkIcon from '@components/icons/LinkIcon';
import LockIcon from '@components/icons/LockIcon';
import friendsState from '@apps/Friends/state';
import { useDebounce } from '@hooks/lodash';
import { UserAvatar } from '@components/AvatarWithStatus';
import InformationVariantCircleIcon from '@components/icons/InformationVariantCircleIcon';
import ShieldCheckIcon from '@components/icons/ShieldCheckIcon';
import { Select } from '@mui/joy';
import EarthIcon from '@components/icons/EarthIcon';
import InformationSlabCircleIcon from '@components/icons/InformationSlabCircleIcon';

export function PasswordMeterInput({
  value,
  onChange,
  disabled,
  updating,
}: {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
  updating?: boolean;
}) {
  const minLength = 12;
  return (
    <Stack
      spacing={0.5}
      sx={{
        mt: 1,
        '--hue': Math.min(value.length * 10, 120),
      }}
    >
      <FormControl>
        <FormLabel required>Password</FormLabel>
        <Input
          type="password"
          placeholder="Type in here…"
          startDecorator={<FormTextboxPasswordIcon size="sm" />}
          endDecorator={
            updating && (
              <Tooltip title="Leave it blank if you dont want to update">
                <InformationSlabCircleIcon />
              </Tooltip>
            )
          }
          value={value}
          onChange={onChange}
          disabled={disabled}
          size="sm"
        />
      </FormControl>
      <LinearProgress
        determinate
        size="sm"
        value={Math.min((value.length * 100) / minLength, 100)}
        sx={{
          bgcolor: 'background.level3',
          color: 'hsl(var(--hue) 80% 40%)',
        }}
      />
      <Typography
        level="body-xs"
        sx={{ alignSelf: 'flex-end', color: 'hsl(var(--hue) 80% 30%)' }}
      >
        {value.length < 3 && 'Very weak'}
        {value.length >= 3 && value.length < 6 && 'Weak'}
        {value.length >= 6 && value.length < 10 && 'Strong'}
        {value.length >= 10 && 'Very strong'}
      </Typography>
    </Stack>
  );
}

interface Cache {
  type: 'search' | 'friends' | 'selected';
  data: UsersModel.Models.IUserInfo;
}

export function UsersAutocomplete({
  selected,
  setSelected,
  error,
  disabled,
}: {
  selected: UsersModel.Models.IUserInfo[];
  setSelected: React.Dispatch<
    React.SetStateAction<UsersModel.Models.IUserInfo[]>
  >;
  error: React.ReactNode;
  disabled: boolean;
}) {
  const [search, setSearch] = React.useState('');
  const friends = useRecoilValue(friendsState.friendsExtended);
  const [searchCache, setSearchCache] = React.useState<Cache[]>([]);
  const [loading, setLoading] = React.useState(false);

  const onQueryChange = useDebounce(
    async (query: string) => {
      setLoading(true);
      try {
        const data = await tunnel.post(
          UsersModel.Endpoints.Targets.SearchUsers,
          {
            query,
            excluseSelf: true,
            exclude: friends.map((friend) => friend.id),
          }
        );
        setSearchCache(data.map((user) => ({ type: 'search', data: user })));
      } catch (e) {
        notifications.error('Failed to search users', (e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    1000,
    [selected, friends]
  );

  const selectedCache = React.useMemo(
    () => selected.map<Cache>((s) => ({ type: 'selected', data: s })),
    [selected]
  );

  const options = React.useMemo(() => {
    const data = new Map<number, Cache>();
    for (const option of selectedCache) data.set(option.data.id, option);
    for (const option of searchCache)
      !data.has(option.data.id) && data.set(option.data.id, option);
    for (const option of friends)
      !data.has(option.id) &&
        data.set(option.id, {
          type: 'friends',
          data: option,
        });
    return [...data.values()];
  }, [searchCache, selectedCache, friends]);

  return (
    <FormControl error={!!error}>
      <FormLabel required>Participants</FormLabel>
      <Autocomplete
        disabled={disabled}
        placeholder="search users.."
        options={loading ? [] : options}
        getOptionLabel={(option) => option.data.nickname}
        groupBy={(option) =>
          option.type === 'search'
            ? 'Search results'
            : option.type === 'friends'
              ? 'Friends'
              : 'Selected'
        }
        isOptionEqualToValue={(option, value) =>
          option.data.id === value.data.id
        }
        value={selectedCache}
        onChange={(_, value) => setSelected(value.map((v) => v.data))}
        multiple={true}
        inputValue={search}
        limitTags={3}
        sx={{ width: (theme) => theme.spacing(41) }}
        loading={loading}
        loadingText={
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size="sm" />
            <Typography level="body-xs">Searching...</Typography>
          </Stack>
        }
        onInputChange={(_, value) => {
          setSearch(value);
          if (value.trim().length > 0) {
            setLoading(true);
            onQueryChange(value);
          } else {
            setLoading(false);
            setSearchCache(
              friends.map((friend) => ({ type: 'friends', data: friend }))
            );
          }
        }}
        startDecorator={<AccountGroupIcon />}
        renderOption={(props: Record<string, unknown>, { data: option }) => (
          <AutocompleteOption
            {...props}
            key={`${option.id}-${option.nickname}`}
            component={Stack}
            direction="row"
            alignItems="center"
            spacing={1}
          >
            <UserAvatar src={option.avatar} size="sm" />
            <Typography level="body-sm" component="span">
              {option.nickname}
            </Typography>
          </AutocompleteOption>
        )}
      />
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

type FormValues = Pick<
  ChatsModel.Models.IChat,
  'authorization' | 'type' | 'name' | 'topic'
> & {
  photo: string;
  authorizationData: ChatsModel.Models.IChatAuthorizationData;
  participants: UsersModel.Models.IUserInfo[];
};

function _NewChatModal(): JSX.Element {
  const { isOpened, close } = useModal('chat:new-chat');

  const form = useForm<FormValues>({
    initialValues: {
      type: ChatsModel.Models.ChatType.Group,
      participants: [],
      authorization: ChatsModel.Models.ChatAccess.Public,
      authorizationData: { password: '' },
      name: '',
      topic: '',
      photo: '',
    },
    validate: {
      participants(value, values) {
        switch (values.type) {
          case ChatsModel.Models.ChatType.Group:
            if (value.length < 1) {
              return 'Group chat should have at least 2 participants';
            }
            break;
          default:
            return null;
        }
      },
      name(value, values) {
        switch (values.type) {
          case ChatsModel.Models.ChatType.Group:
            if (value.trim().length < 3) {
              return 'Group chat name should have at least 3 characters';
            }
            break;
          default:
            return null;
        }
      },
      photo(value, values) {
        switch (values.type) {
          case ChatsModel.Models.ChatType.Group:
            if (!value) return null;
            if (!urlRegex.test(value)) return 'Photo should be a valid url';
            if (
              !value.endsWith('.png') &&
              !value.endsWith('.jpg') &&
              !value.endsWith('.jpeg') &&
              !value.endsWith('.gif') &&
              !value.endsWith('.webp') &&
              isNaN(parseInt(value))
            )
              return 'Photo should be a valid image url';
            break;
        }
        return null;
      },
    },
  });
  const [loading, setLoading] = React.useState(false);

  const onSubmit = useRecoilCallback(
    (ctx) =>
      async ({
        authorization,
        authorizationData,
        name,
        participants,
        photo,
        topic,
        type,
      }: FormValues) => {
        const payload: ChatsModel.DTO.NewChat = {
          authorization,
          authorizationData:
            authorization === ChatsModel.Models.ChatAccess.Protected
              ? authorizationData
              : null,
          name,
          participants: participants.map<
            ChatsModel.DTO.NewChat['participants'][number]
          >((p) => ({
            userId: p.id,
            role: ChatsModel.Models.ChatParticipantRole.Member,
          })),
          photo: photo.trim().length > 0 ? photo : null,
          topic,
          type,
        };
        setLoading(true);
        const notif = notifications.default('Creating new chat...');
        try {
          const chatId = await tunnel.put(
            ChatsModel.Endpoints.Targets.CreateChat,
            payload
          );
          notif.update({
            message: 'Chat created successfully!',
            color: 'success',
          });
          ctx.set(chatsState.chats, (prev) => [...prev, chatId]);
          close();
        } catch (e) {
          console.error(e);
          notif.update({
            title: 'Failed to create chat!',
            description: (e as Error).message,
            color: 'danger',
          });
        } finally {
          setLoading(false);
        }
      },
    [close]
  );

  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog size="md">
        <DialogTitle>New Chat</DialogTitle>
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack spacing={2} position="relative">
            <FormControl error={!!form.errors.name}>
              <FormLabel required>Group Name</FormLabel>
              <Input
                disabled={loading}
                required
                placeholder="Enter group name"
                {...form.getInputProps('name')}
                startDecorator={<LabelIcon />}
                endDecorator={
                  <Typography
                    level="body-sm"
                    textColor={loading ? 'neutral.700' : undefined}
                  >
                    {form.values.name.trim().length}/50
                  </Typography>
                }
              />
              {form.errors.name && (
                <FormHelperText>{form.errors.name}</FormHelperText>
              )}{' '}
            </FormControl>
            <FormControl error={!!form.errors.topic}>
              <FormLabel>Group Topic</FormLabel>
              <Textarea
                disabled={loading}
                placeholder={'Enter group topic'}
                {...form.getInputProps('topic')}
                minRows={3}
                maxRows={3}
                sx={{
                  [`& .${textareaClasses.endDecorator}`]: {
                    mr: 1,
                  },
                }}
                endDecorator={
                  <Typography
                    level="body-sm"
                    ml="auto"
                    textColor={loading ? 'neutral.700' : undefined}
                  >
                    {form.values.topic.trim().length}/200
                  </Typography>
                }
              />
              {form.errors.topic && (
                <FormHelperText>{form.errors.topic}</FormHelperText>
              )}
            </FormControl>
            <FormControl error={!!form.errors.photo}>
              <FormLabel>Group Photo</FormLabel>
              <Stack direction="row" spacing={2}>
                <Avatar
                  src={
                    (form.isValid('photo') && form.values.photo) || undefined
                  }
                >
                  {(!form.isValid('photo') || !form.values.photo) && (
                    <ImageIcon size="md" color="neutral" />
                  )}
                </Avatar>
                <Input
                  disabled={loading}
                  type="url"
                  placeholder="Enter group photo url"
                  {...form.getInputProps('photo')}
                  startDecorator={<LinkIcon />}
                />
              </Stack>
              {form.errors.photo && (
                <FormHelperText>{form.errors.photo}</FormHelperText>
              )}
            </FormControl>
            <div>
              <FormControl required>
                <FormLabel>Group Access</FormLabel>
                <Select
                  required
                  startDecorator={<ShieldCheckIcon />}
                  value={form.values.authorization}
                  onChange={(_, value) =>
                    form.setFieldValue('authorization', value as any)
                  }
                  placeholder="Select one"
                  style={{
                    width: '50%',
                  }}
                >
                  <Option value={ChatsModel.Models.ChatAccess.Public}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <EarthIcon />
                      <Typography level="body-md" component="div">
                        Public
                      </Typography>
                    </Stack>
                    <Tooltip title="Anyone can join" placement="right">
                      <InformationVariantCircleIcon size="xs" color="neutral" />
                    </Tooltip>
                  </Option>
                  <Option value={ChatsModel.Models.ChatAccess.Protected}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <FormTextboxPasswordIcon />
                      <Typography level="body-md" component="div">
                        Protected
                      </Typography>
                    </Stack>
                    <Tooltip
                      title="Still public but requires password to join"
                      placement="right"
                    >
                      <InformationVariantCircleIcon size="xs" color="neutral" />
                    </Tooltip>
                  </Option>
                  <Option value={ChatsModel.Models.ChatAccess.Private}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LockIcon />
                      <Typography level="body-md" component="div">
                        Private
                      </Typography>
                    </Stack>
                    <Tooltip
                      title="Only invited users can join"
                      placement="right"
                    >
                      <InformationVariantCircleIcon size="xs" color="neutral" />
                    </Tooltip>
                  </Option>
                </Select>
              </FormControl>
              <Collapse
                opened={
                  form.values.authorization ===
                  ChatsModel.Models.ChatAccess.Protected
                }
              >
                <PasswordMeterInput
                  disabled={loading}
                  value={form.values.authorizationData.password || ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    form.setFieldValue('authorizationData', {
                      password: event.target.value,
                    })
                  }
                />
              </Collapse>
            </div>
            <React.Suspense fallback={<CircularProgress />}>
              <UsersAutocomplete
                selected={form.values.participants}
                setSelected={
                  form.setFieldValue.bind(null, 'participants') as any
                }
                error={form.errors.participants}
                disabled={loading}
              />
            </React.Suspense>
          </Stack>
          <DialogActions>
            <Stack direction="row" spacing={2} ml="auto">
              <Button
                variant="plain"
                onClick={close}
                color="neutral"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="solid" loading={loading}>
                Create
              </Button>
            </Stack>
          </DialogActions>
        </form>
      </ModalDialog>
    </Modal>
  );
}

const NewChatModal = React.memo(_NewChatModal);

export default NewChatModal;

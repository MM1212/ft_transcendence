import React from 'react';
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Stack from '@mui/joy/Stack';
import Icon from '@components/Icon';
import {
  faKey,
  faLock,
  faPhotoVideo,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { useModal } from '@hooks/useModal';
import { useForm } from '@mantine/form';
import ChatsModel from '@typings/models/chat';
import { Avatar, Checkbox, FormHelperText, Textarea } from '@mui/joy';

const urlRegex =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

import LinearProgress from '@mui/joy/LinearProgress';
import Typography from '@mui/joy/Typography';
import { useTunnelEndpoint } from '@hooks/tunnel';
import UsersModel from '@typings/models/users';
import { Autocomplete } from '@mui/joy';
import debounce from 'lodash.debounce';
import tunnel from '@lib/tunnel';

function PasswordMeterInput({ value, onChange }: any) {
  const minLength = 12;
  return (
    <Stack
      spacing={0.5}
      sx={{
        '--hue': Math.min(value.length * 10, 120),
      }}
    >
      <Input
        type="password"
        placeholder="Type in here…"
        startDecorator={<Icon icon={faKey} />}
        value={value}
        onChange={onChange}
      />
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

function UsersAutocomplete({
  selected,
  setSelected,
}: {
  selected: UsersModel.Models.IUserInfo[];
  setSelected: React.Dispatch<
    React.SetStateAction<UsersModel.Models.IUserInfo[]>
  >;
}) {
  const [search, setSearch] = React.useState('');
  const [cache, setCache] = React.useState<UsersModel.Models.IUserInfo[]>([]);
  const [loading, setLoading] = React.useState(false);

  const onQueryChange = React.useCallback(
    debounce(async (query: string) => {
      setLoading(true);
      try {
        const resp = await tunnel.post(
          UsersModel.Endpoints.Targets.SearchUsers,
          {
            query,
            excluseSelf: true,
          }
        );
        setLoading(false);
        if (resp.status === 'error') {
          console.error(resp.errorMsg);
          return;
        }
        setCache(resp.data);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }, 1000),
    []
  );

  return (
    <FormControl>
      <FormLabel>Participants</FormLabel>
      <Autocomplete
        placeholder="search users.."
        options={cache}
        getOptionLabel={(option) => option.nickname}
        value={selected}
        onChange={(_, value) => setSelected(value)}
        multiple={true}
        sx={{ width: 300 }}
        inputValue={search}
        limitTags={3}
        loading={loading}
        onInputChange={(_, value) => {
          setSearch(value);
          if (value.trim().length > 5) {
            setLoading(true);
            onQueryChange(value);
          }
        }}
      />
    </FormControl>
  );
}

export default function NewChatModal(): JSX.Element {
  const { isOpened, close } = useModal('chat:new-chat');
  console.log('BOAS');

  const form = useForm<
    Pick<
      ChatsModel.Models.IChat,
      'authorization' | 'type' | 'name' | 'topic'
    > & {
      photo: string;
      authorizationData: ChatsModel.Models.IChatAuthorizationData;
      participants: UsersModel.Models.IUserInfo[];
    }
  >({
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
            if (value.length < 2) {
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
              !value.endsWith('.gif')
            )
              return 'Photo should be a valid image url';
            break;
        }
        return null;
      },
    },
  });
  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog>
        <DialogTitle>Create new project</DialogTitle>
        <DialogContent>Fill in the information of the project.</DialogContent>
        <form onSubmit={form.onSubmit(console.log)}>
          <Stack spacing={2}>
            <FormControl error={!form.isValid('name') && form.isDirty('name')}>
              <FormLabel>Group Name</FormLabel>
              <Input
                required
                placeholder="Enter group name"
                {...form.getInputProps('name')}
              />
              <FormHelperText>
                {!form.isValid('name')
                  ? form.errors.name
                  : 'Group name should have at least 3 characters'}
              </FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Group Topic</FormLabel>
              <Textarea
                placeholder="Enter group topic"
                {...form.getInputProps('topic')}
                minRows={3}
                maxRows={3}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Group Photo</FormLabel>
              <Stack direction="row" spacing={2}>
                <Avatar
                  src={form.isValid('photo') ? form.values.photo : undefined}
                >
                  {!form.isValid('photo') && (
                    <Icon icon={faPhotoVideo} size="lg" color="gray" />
                  )}
                </Avatar>
                <Input
                  type="url"
                  placeholder="Enter group photo url"
                  {...form.getInputProps('photo')}
                />
              </Stack>
              <FormHelperText>Photo should be a valid image url</FormHelperText>
            </FormControl>
            <FormControl>
              <FormLabel>Group Access</FormLabel>
              <Checkbox
                label="Is Private"
                variant="outlined"
                color="primary"
                checked={
                  form.values.authorization ===
                  ChatsModel.Models.ChatAccess.Private
                }
                checkedIcon={<Icon icon={faLock} size="xs" />}
                onChange={(ev) =>
                  form.setFieldValue(
                    'authorization',
                    ev.target.checked
                      ? ChatsModel.Models.ChatAccess.Private
                      : ChatsModel.Models.ChatAccess.Public
                  )
                }
                sx={{ mb: 1 }}
              />
              {form.values.authorization ===
                ChatsModel.Models.ChatAccess.Private && (
                <PasswordMeterInput
                  value={form.values.authorizationData.password || ''}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    form.setFieldValue('authorizationData', {
                      password: event.target.value,
                    })
                  }
                />
              )}
            </FormControl>
            <UsersAutocomplete
              selected={form.values.participants}
              setSelected={form.setFieldValue.bind(null, 'participants') as any}
            />
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}

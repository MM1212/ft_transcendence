import {
  Avatar,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Option,
  Select,
  Typography,
  textareaClasses,
} from '@mui/joy';
import {
  useChatInfoEditModal,
  useChatInfoEditModalActions,
} from './hooks/useChatInfoEditModal';
import useChat from '@apps/Chat/hooks/useChat';
import React from 'react';
import ChatsModel from '@typings/models/chat';
import { Stack } from '@mui/joy';
import LabelIcon from '@components/icons/LabelIcon';
import { Textarea } from '@mui/joy';
import LinkIcon from '@components/icons/LinkIcon';
import ImageIcon from '@components/icons/ImageIcon';
import ShieldCheckIcon from '@components/icons/ShieldCheckIcon';
import EarthIcon from '@components/icons/EarthIcon';
import { Tooltip } from '@mui/joy';
import InformationVariantCircleIcon from '@components/icons/InformationVariantCircleIcon';
import FormTextboxPasswordIcon from '@components/icons/FormTextboxPasswordIcon';
import LockIcon from '@components/icons/LockIcon';
import Collapse from '@components/transitions/Collapse';
import { PasswordMeterInput } from '@apps/Chat/components/NewChat';
import useChatManageActions from '@apps/Chat/hooks/useChatManageActions';

type InputState = ChatsModel.Models.IChatInfo & {
  passwordInput: string;
};

const Access = ChatsModel.Models.ChatAccess;

function ChatInfoEditContent({ chatId }: { chatId: number }) {
  const chat = useChat(chatId).useSelf();

  const formatChat = React.useCallback<() => InputState>(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { messages, participants, ...info } = chat;
    return {
      ...info,
      photo: info.photo ?? '',
      participantsCount: participants.length,
      passwordInput: '',
    };
  }, [chat]);
  const [input, setInput] = React.useState<InputState>(formatChat);

  React.useEffect(() => {
    setInput(formatChat());
  }, [formatChat]);

  const updateProperty = React.useCallback(
    <T extends keyof InputState>(key: T) =>
      (value: InputState[T]) => {
        setInput((prev) => ({ ...prev, [key]: value }));
      },
    []
  );
  const updateInputProperty = React.useCallback(
    <T extends keyof InputState, E extends HTMLElement = HTMLInputElement>(
      key: T
    ) =>
      (event: React.ChangeEvent<E>) => {
        updateProperty(key)(
          (event.target as unknown as HTMLInputElement).value as InputState[T]
        );
      },
    [updateProperty]
  );
  const propertiesUpdated = React.useMemo(() => {
    if (!chat) return false;
    if (
      input.authorization === Access.Protected &&
      chat.authorization !== input.authorization &&
      input.passwordInput.trim().length === 0
    )
      return false;
    for (const key in input) {
      if (
        input[key as keyof InputState] !==
          chat[key as keyof ChatsModel.Models.IChat] &&
        chat[key as keyof ChatsModel.Models.IChat] !== undefined
      )
        return true;
    }
    return false;
  }, [input, chat]);

  const { close } = useChatInfoEditModalActions();
  const { updateInfo } = useChatManageActions();

  return (
    <>
      <DialogContent>
        <Stack spacing={2}>
          <FormControl>
            <FormLabel required>Group Name</FormLabel>
            <Input
              required
              placeholder="Enter group name"
              value={input.name}
              startDecorator={<LabelIcon />}
              endDecorator={
                <Typography level="body-sm">
                  {input.name.trim().length}/50
                </Typography>
              }
              onChange={updateInputProperty('name')}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Group Topic</FormLabel>
            <Textarea
              value={input.topic}
              placeholder={'Enter group topic'}
              // {...form.getInputProps('topic')}
              minRows={3}
              maxRows={3}
              sx={{
                [`& .${textareaClasses.endDecorator}`]: {
                  mr: 1,
                },
              }}
              endDecorator={
                <Typography level="body-sm" ml="auto">
                  {input.topic.trim().length}/200
                </Typography>
              }
              onChange={updateInputProperty('topic')}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Group Photo</FormLabel>
            <Stack direction="row" spacing={2}>
              <Avatar
                // src={(form.isValid('photo') && form.values.photo) || undefined}
                src={input.photo ?? undefined}
              >
                <ImageIcon size="md" color="neutral" />
              </Avatar>
              <Input
                type="url"
                placeholder="Enter group photo url"
                startDecorator={<LinkIcon />}
                value={input.photo as string}
                onChange={updateInputProperty('photo')}
              />
            </Stack>
          </FormControl>
          <div>
            <FormControl required>
              <FormLabel>Group Access</FormLabel>
              <Select
                required
                startDecorator={<ShieldCheckIcon />}
                value={input.authorization}
                onChange={(_, value) =>
                  value && updateProperty('authorization')(value)
                }
                placeholder="Select one"
                style={{
                  width: '50%',
                }}
              >
                <Option value={Access.Public}>
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
                <Option value={Access.Protected}>
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
                <Option value={Access.Private}>
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
            <Collapse opened={input.authorization === Access.Protected}>
              <PasswordMeterInput
                value={input.passwordInput}
                onChange={updateInputProperty('passwordInput')}
                updating
              />
            </Collapse>
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={2} ml="auto">
          <Button variant="plain" onClick={close} color="neutral">
            Cancel
          </Button>
          <Button
            disabled={!propertiesUpdated}
            type="submit"
            variant="solid"
            onClick={() => {
              updateInfo({
                name: input.name,
                authorization: input.authorization,
                authorizationData:
                  input.authorization === Access.Protected
                    ? {
                        password: input.passwordInput,
                      }
                    : {},
                photo: input.photo?.trim().length ? input.photo : null,
                topic: input.topic,
              });
            }}
          >
            Save
          </Button>
        </Stack>
      </DialogActions>
    </>
  );
}

export default function ChatInfoEditModal() {
  const { close, isOpened, data } = useChatInfoEditModal();
  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog>
        <DialogTitle>Edit Chat</DialogTitle>
        <ChatInfoEditContent chatId={data.chatId} />
      </ModalDialog>
    </Modal>
  );
}

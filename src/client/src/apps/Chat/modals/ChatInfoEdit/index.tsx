import {
  Avatar,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalDialog,
  Option,
  Select,
  Typography,
  textareaClasses,
} from '@mui/joy';
import { useChatInfoEditModal } from './hooks/useChatInfoEditModal';
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

function ModalContent({ chatId }: { chatId: number }) {
  const chat = useChat(chatId).useSelf();

  const formatChat = React.useCallback<
    () => ChatsModel.Models.IChatInfo
  >(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { messages, participants, ...info } = chat;
    return {
      ...info,
      photo: info.photo ?? '',
      participantsCount: participants.length,
    };
  }, [chat]);
  const [input, setInput] =
    React.useState<ChatsModel.Models.IChatInfo>(formatChat);

  React.useEffect(() => {
    setInput(formatChat());
  }, [formatChat]);

  const updateProperty = React.useCallback(
    <T extends keyof ChatsModel.Models.IChatInfo>(key: T) =>
      (value: ChatsModel.Models.IChatInfo[T]) => {
        setInput((prev) => ({ ...prev, [key]: value }));
      },
    []
  );
  const updateInputProperty = React.useCallback(
    <
      T extends keyof ChatsModel.Models.IChatInfo,
      E extends HTMLElement = HTMLInputElement,
    >(
      key: T
    ) =>
      (event: React.ChangeEvent<E>) => {
        updateProperty(key)(
          (event.target as unknown as HTMLInputElement)
            .value as ChatsModel.Models.IChatInfo[T]
        );
      },
    [updateProperty]
  );
  const propertiesUpdated = React.useMemo(() => {
    if (!chat) return false;
    for (const key in input) {
      if (
        input[key as keyof ChatsModel.Models.IChatInfo] !==
          chat[key as keyof ChatsModel.Models.IChat] &&
        chat[key as keyof ChatsModel.Models.IChat] !== undefined
      )
        return true;
    }
    return false;
  }, [input, chat]);

  return (
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
            onChange={(e, value) => value && updateProperty('authorization')(value)}
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
              <Tooltip title="Only invited users can join" placement="right">
                <InformationVariantCircleIcon size="xs" color="neutral" />
              </Tooltip>
            </Option>
          </Select>
        </FormControl>
        <Collapse
          opened={
            input.authorization === ChatsModel.Models.ChatAccess.Protected
          }
        >
          <PasswordMeterInput
            value={''}
            onChange={() => console.log('password changed')}
          />
        </Collapse>
      </div>
    </Stack>
  );
}
export default function ChatInfoEditModal() {
  const { close, isOpened, data } = useChatInfoEditModal();
  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog>
        <DialogTitle>Edit Chat</DialogTitle>
        <DialogContent>
          <ModalContent chatId={data.chatId} />
        </DialogContent>
        <DialogActions>
          <Stack direction="row" spacing={2} ml="auto">
            <Button variant="plain" onClick={close} color="neutral">
              Cancel
            </Button>
            <Button type="submit" variant="solid">
              Save
            </Button>
          </Stack>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

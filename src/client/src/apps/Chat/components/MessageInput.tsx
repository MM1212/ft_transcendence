import * as React from 'react';
import FormControl from '@mui/joy/FormControl';
import Textarea from '@mui/joy/Textarea';
import { FormLabel, IconButton, Stack, Typography } from '@mui/joy';
import SendIcon from '@components/icons/SendIcon';
import { useRecoilCallback, useRecoilState } from 'recoil';
import chatsState from '@/apps/Chat/state';
import tunnel from '@lib/tunnel';
import ChatsModel from '@typings/models/chat';
import notifications from '@lib/notifications/hooks';
import useChat from '../hooks/useChat';
import moment from 'moment';
import TimelapseIcon from '@components/icons/TimelapseIcon';
import MessageInputBlocked from './MessageInputBlocked';
import { urlRegex } from './NewChat';
import { useDebounce, useThrottle } from '@hooks/lodash';
import escape from 'lodash.escape';

function _ParticipantsTyping({ id }: { id: number; selfId: number }) {
  const participantNames = useChat(id).useParticipantNamesTyping();

  const [threeDots, setThreeDots] = React.useState('');

  React.useEffect(() => {
    if (participantNames.length === 0) return;
    const interval = setInterval(() => {
      setThreeDots((prev) => {
        if (prev.length === 3) return '';
        return prev + '.';
      });
    }, 500);
    return () => clearInterval(interval);
  }, [participantNames]);

  if (participantNames.length === 0) return null;
  return (
    <Typography
      level="body-xs"
      color="neutral"
      position="absolute"
      mt={0.5}
      ml={0.5}
    >
      {participantNames}
      {threeDots}
    </Typography>
  );
}

const ParticipantsTyping = React.memo(_ParticipantsTyping);

export interface ChatMessageInputProps {
  id: number;
  rootProps?: React.ComponentProps<typeof Stack>;
  inputProps?: React.ComponentProps<typeof Textarea>;
  submitBtnProps?: React.ComponentProps<typeof IconButton>;
}

function MessageInput({
  id,
  rootProps,
  inputProps,
  submitBtnProps,
}: ChatMessageInputProps) {
  const [input, setInput] = useRecoilState(chatsState.chatsInput(id));
  const formRef = React.useRef<HTMLFormElement>(null);

  const setIsTyping = React.useCallback(
    async (state: boolean) => {
      try {
        await tunnel.put(
          ChatsModel.Endpoints.Targets.SetTyping,
          {
            state,
          },
          {
            chatId: id,
          }
        );
      } catch (e) {
        console.error(e);
      }
    },
    [id]
  );
  const updateToTyping = useThrottle(() => setIsTyping(true), 3000, [
    setIsTyping,
  ]);
  const clearIsTyping = useDebounce(() => setIsTyping(false), 500, [
    setIsTyping,
  ]);

  const submit = useRecoilCallback(
    (ctx) => async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const input = (
        e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement
      ).value;
      if (input.trim().length === 0) return;
      try {
        const chat = await ctx.snapshot.getPromise(chatsState.chat(id));
        if (!chat) throw new Error('Could not find chat');
        const selfParticipant = await ctx.snapshot.getPromise(
          chatsState.selfParticipantByChat(chat.id)
        );
        const nonce = Math.random().toString(36).slice(2);
        const messagePayload: ChatsModel.DTO.NewMessage = {
          message: escape(input.trim()),
          type: ChatsModel.Models.ChatMessageType.Normal,
          meta: {},
        };
        // Attachments embed
        if (messagePayload.message.match(urlRegex)) {
          messagePayload.type = ChatsModel.Models.ChatMessageType.Embed;
          const message = messagePayload.message;
          messagePayload.meta = {
            type: ChatsModel.Models.Embeds.Type.Media,
            urls: [],
          };
          messagePayload.meta.urls!.push(
            ...message
              .match(new RegExp(urlRegex, 'g'))!
              .map((url) => url.trim())
              .filter((url) =>
                /(jpg|png|gif|jpeg|webp|webm)/g.test(
                  url.slice(url.lastIndexOf('.') + 1)
                )
              )
              .filter((url, i, arr) => arr.indexOf(url) === i)
          );
          urlRegex.lastIndex = 0;
          if (messagePayload.meta.urls!.length === 0) {
            messagePayload.type = ChatsModel.Models.ChatMessageType.Normal;
            messagePayload.meta = {};
          }
        }
        ctx.set(chatsState.messages(chat.id), (prev) => [
          {
            ...messagePayload,
            id: nonce as any,
            chatId: chat.id,
            createdAt: Date.now(),
            authorId: selfParticipant.id,
            pending: true,
          },
          ...prev,
        ]);
        setInput('');
        await clearIsTyping();
        const resp = await tunnel.rawPut(
          ChatsModel.Endpoints.Targets.CreateMessage,
          messagePayload,
          { chatId: id }
        );
        if (resp.status !== 'ok') {
          ctx.set(chatsState.messages(chat.id), (prev) =>
            prev.filter((msg) => msg.id !== (nonce as any))
          );
          throw new Error(resp.errorMsg ?? 'Unknown Error');
        }
        ctx.set(chatsState.messages(chat.id), (prev) => {
          const next = [...prev];
          const idx = next.findIndex((msg) => msg.id === (nonce as any));
          if (idx === -1) return next;
          next[idx] = resp.data;
          return next;
        });
      } catch (e) {
        console.error(e);
        notifications.error('Could not send message', (e as Error).message);
      }
    },
    [clearIsTyping, id, setInput]
  );
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, id]);

  const self = useChat(id).useSelfParticipant();

  const mutedData = useChat(id).useIsSelfMutedComputed();

  return (
    <Stack
      sx={{ px: 2, pb: 3 }}
      direction="row"
      alignItems="flex-end"
      spacing={1}
      width="100%"
      position="relative"
      component="form"
      {...(rootProps as any)}
      onSubmit={submit}
      ref={formRef}
    >
      <FormControl
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <FormLabel>
          <ParticipantsTyping id={id} selfId={self.id} />
        </FormLabel>
        <Textarea
          placeholder={
            !mutedData.is
              ? 'Type something here…'
              : `You've been muted until ${
                  mutedData.type === 'permanent'
                    ? 'forever'
                    : moment(self.mutedUntil).format('lll')
                }`
          }
          minRows={1}
          maxRows={10}
          {...inputProps}
          name="message"
          disabled={mutedData.is}
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value.trim().length === 0) clearIsTyping();
            else updateToTyping();
          }}
          value={input}
          sx={{
            mt: 1,
            '& textarea:first-of-type': {},
            flexGrow: 1,
          }}
          slotProps={{
            textarea: {
              ref: inputRef,
            },
          }}
          onKeyDown={(event) => {
            if (
              event.code === 'Enter' &&
              !event.altKey &&
              !event.ctrlKey &&
              !event.shiftKey
            ) {
              event.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
        />
      </FormControl>
      <IconButton
        size="md"
        color="primary"
        variant="plain"
        sx={{
          borderRadius: (theme) => theme.radius.xl,
        }}
        {...submitBtnProps}
        type="submit"
        disabled={input.trim().length === 0 || mutedData.is}
      >
        {!mutedData.is ? (
          <SendIcon size="sm" />
        ) : (
          <TimelapseIcon color="neutral" />
        )}
      </IconButton>
    </Stack>
  );
}

export default function MessageInputSelector(
  props: ChatMessageInputProps
): JSX.Element {
  const isTargetRecipientBlocked = useChat(
    props.id
  ).useIsTargetRecipientBlocked();
  if (isTargetRecipientBlocked) return <MessageInputBlocked id={props.id} />;
  return <MessageInput {...props} />;
}

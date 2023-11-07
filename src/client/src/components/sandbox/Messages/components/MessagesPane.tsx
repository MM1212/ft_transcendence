import * as React from 'react';
import Box, { BoxProps } from '@mui/joy/Box';
import Sheet from '@mui/joy/Sheet';
import Stack, { StackProps } from '@mui/joy/Stack';
import ChatBubble from './ChatBubble';
import MessageInput from './MessageInput';
import MessagesPaneHeader from './MessagesPaneHeader';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import chatsState from '../state';
import tunnel from '@lib/tunnel';
import ChatsModel from '@typings/models/chat';
import notifications from '@lib/notifications/hooks';
import InfiniteScroll from '@components/InfiniteScroll';
import { CircularProgress, Typography } from '@mui/joy';

function ChatMessages({ id }: { id: number }) {
  const messages = useRecoilValue(chatsState.messages(id));

  const [hasMore, setHasMore] = React.useState(true);

  const resetMessages = useRecoilCallback(
    (ctx) => async () => {
      const chats = await ctx.snapshot.getPromise(chatsState.chats);
      const chatIdx = chats.findIndex((chat) => chat.id === id);
      if (chatIdx === -1) return;
      const chat = { ...chats[chatIdx] };
      chat.messages = chat.messages.slice(
        0,
        ChatsModel.Models.MAX_MESSAGES_PER_CHAT
      );
      ctx.set(chatsState.chats, (prev) => {
        const next = [...prev];
        next[chatIdx] = chat;
        return next;
      });
    },
    [id]
  );

  React.useEffect(() => {
    resetMessages();
  }, [resetMessages]);

  React.useEffect(() => {
    setHasMore(true);
  }, [id, messages]);

  const next = useRecoilCallback(
    (ctx) => async () => {
      const chats = await ctx.snapshot.getPromise(chatsState.chats);
      const chatIdx = chats.findIndex((chat) => chat.id === id);
      if (chatIdx === -1) return;
      const chat = { ...chats[chatIdx] };
      const lastMessageId = chat.messages.length
        ? chat.messages[chat.messages.length - 1]?.id ?? -1
        : -1;
      console.log(`Fetching messages from ${lastMessageId}`);

      try {
        const resp = await tunnel.get(
          ChatsModel.Endpoints.Targets.GetChatMessages,
          {
            chatId: id,
            cursor: lastMessageId,
          }
        );
        if (resp.status !== 'ok') throw new Error(resp.errorMsg);
        const messages = resp.data;
        console.log(
          `Loaded ${messages.length} from ${lastMessageId} as cursor to ${
            messages.length ? messages[messages.length - 1]?.id ?? -1 : -1
          }`
        );
        if (messages.length === 0) return setHasMore(false);
        ctx.set(chatsState.chats, (prev) => {
          const next = [...prev];
          next[chatIdx] = {
            ...chat,
            messages: [...chat.messages, ...messages],
          };
          return next;
        });
      } catch (e) {
        console.error(e);
        notifications.error('Failed to fetch messages', (e as Error).message);
      }
    },
    [id, setHasMore]
  );

  const computeMessageFeatures = React.useCallback(
    (messages: ChatsModel.Models.IChatMessage[], messageIdx: number) => {
      const message = messages[messageIdx];
      const prev = messages[messageIdx + 1];
      const next = messages[messageIdx - 1];
      const hasPrev =
        prev &&
        prev.authorId === message.authorId &&
        Math.abs(prev.createdAt - message.createdAt) < 60000;
      const hasNext =
        next &&
        next.authorId === message.authorId &&
        Math.abs(message.createdAt - next.createdAt) < 60000;
      return {
        prev: !!hasPrev,
        next: !!hasNext,
      };
    },
    []
  );

  return React.useMemo(
    () => (
      <InfiniteScroll
        boxProps={
          {
            component: Stack,
            spacing: 2,
            justifyContent: 'flex-end',
            direction: 'column-reverse',
          } as unknown as BoxProps & StackProps
        }
        next={next}
        hasMore={hasMore}
        loader={
          <CircularProgress
            color="primary"
            sx={{
              position: 'absolute',
              my: 2,
              mx: 'auto',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        }
        endMessage={
          <Typography
            sx={{
              mx: 'auto',
              my: 2,
            }}
            color="neutral"
            level="body-xs"
            textAlign="center"
          >
            No more messages to load.
          </Typography>
        }
        inverse
      >
        {messages.map((message, index: number) => {
          const features = computeMessageFeatures(messages, index);
          return (
            <React.Suspense fallback={<></>} key={`${id}-${message.id}`}>
              <ChatBubble
                chatId={id}
                messageId={message.id}
                message={message}
                key={`${id}-${message.id}`}
                featuresNext={features.next}
                featuresPrev={features.prev}
              />
            </React.Suspense>
          );
        })}
      </InfiniteScroll>
    ),
    [computeMessageFeatures, hasMore, id, messages, next]
  );
}

export default function MessagesPane() {
  const selectedChatId = useRecoilValue(chatsState.selectedChatId);
  if (selectedChatId === -1) return null;
  return (
    <Sheet
      sx={{
        height: { xs: 'calc(100dvh - var(--Header-height))', lg: '100dvh' },
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.level1',
      }}
    >
      <React.Suspense fallback={<></>}>
        <MessagesPaneHeader />
      </React.Suspense>

      <React.Suspense fallback={<></>}>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          <ChatMessages id={selectedChatId} />
        </Box>
      </React.Suspense>

      <MessageInput id={selectedChatId} />
    </Sheet>
  );
}

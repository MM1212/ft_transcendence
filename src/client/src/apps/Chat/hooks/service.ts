import { useSseEvent } from '@hooks/sse';
import ChatsModel from '@typings/models/chat';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import chatsState from '../state';
import React from 'react';
import tunnel from '@lib/tunnel';
import notifications from '@lib/notifications/hooks';

const useMessagesService = () => {
  const onNewMessage = useRecoilCallback(
    (ctx) => async (ev: ChatsModel.Sse.NewMessageEvent) => {
      const { data } = ev;
      const chats = [...(await ctx.snapshot.getPromise(chatsState.chats))];
      const chatIdx = chats.findIndex((chat) => chat.id === data.chatId);
      const selectedChatId = await ctx.snapshot.getPromise(
        chatsState.selectedChatId
      );
      if (chatIdx === -1) return;
      if (
        chats[chatIdx].messages.findIndex(
          (message) => message.id === data.id
        ) !== -1
      )
        return;
      const chat = { ...chats[chatIdx] };
      chat.messages = [data, ...chat.messages];
      if (selectedChatId !== data.chatId)
        chat.participants = chat.participants.map((p) => {
          return {
            ...p,
            toReadPings: p.toReadPings + 1,
          } as ChatsModel.Models.IChatParticipant;
        });
      chats[chatIdx] = chat;
      ctx.set(chatsState.chats, chats);
    },
    []
  );

  const onNewChat = useRecoilCallback(
    (ctx) => async (ev: ChatsModel.Sse.NewChatEvent) => {
      const { data } = ev;
      const chats = [...(await ctx.snapshot.getPromise(chatsState.chats))];
      chats.push({
        ...data,
        authorizationData: null,
      } satisfies ChatsModel.Models.IChat);
      ctx.set(chatsState.chats, chats);
    },
    []
  );

  const selectedChatId = useRecoilValue(chatsState.selectedChatId);

  const onSelectedChatIdChange = useRecoilCallback(
    (ctx) => async (chatId: number) => {
      if (chatId === -1) return;
      const self = await ctx.snapshot.getPromise(
        chatsState.selfParticipantByChat(chatId)
      );
      if (!self || !self.toReadPings) return;
      try {
        await tunnel.patch(
          ChatsModel.Endpoints.Targets.UpdateParticipant,
          {
            toReadPings: 0,
          },
          { chatId, participantId: self.id }
        );
        ctx.set(chatsState.selfParticipantByChat(chatId), (prev) => ({
          ...prev,
          toReadPings: 0,
        }));
      } catch (e) {
        console.error(e);
        notifications.error(
          'Failed to update read pings',
          (e as Error).message
        );
      }
    },
    []
  );

  React.useEffect(
    () => void onSelectedChatIdChange(selectedChatId),
    [onSelectedChatIdChange, selectedChatId]
  );
  useSseEvent<ChatsModel.Sse.NewMessageEvent>(
    ChatsModel.Sse.Events.NewMessage,
    onNewMessage
  );
  useSseEvent<ChatsModel.Sse.NewChatEvent>(
    ChatsModel.Sse.Events.NewChat,
    onNewChat
  );
};

export default useMessagesService;

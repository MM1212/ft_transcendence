import { useSseEvent } from '@hooks/sse';
import ChatsModel from '@typings/models/chat';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import chatsState from '../state';
import React from 'react';
import tunnel from '@lib/tunnel';
import notifications from '@lib/notifications/hooks';
import isEqual from 'lodash.isequal';

const useMessagesService = () => {
  const onNewMessage = useRecoilCallback(
    (ctx) => async (ev: ChatsModel.Sse.NewMessageEvent) => {
      const { data } = ev;
      const chats = [...(await ctx.snapshot.getPromise(chatsState.chats))];
      const chatIdx = chats.indexOf(data.chatId);
      const selectedChatId = await ctx.snapshot.getPromise(
        chatsState.selectedChatId
      );
      if (chatIdx === -1) return;
      ctx.set(chatsState.messages(data.chatId), (prev) => {
        if (prev.some((message) => message.id === data.id)) return prev;
        const messages = [data, ...prev];
        if (selectedChatId !== data.chatId)
          ctx.set(chatsState.selfParticipantByChat(data.chatId), (prev) => ({
            ...prev,
            toReadPings: prev.toReadPings + 1,
          }));
        return messages;
      });
    },
    []
  );

  const onNewChat = useRecoilCallback(
    (ctx) => async (ev: ChatsModel.Sse.NewChatEvent) => {
      const { data } = ev;
      ctx.set(chatsState.chats, (prev) => [...prev, data.chatId]);
    },
    []
  );

  const selectedChatId = useRecoilValue(chatsState.selectedChatId);
  const lastSelectedChatId = React.useRef(-1);

  const onSelectedChatIdChange = useRecoilCallback(
    (ctx) =>
      async (chatId: number, force: boolean = false, last: boolean = false) => {
        if (!last)
          onSelectedChatIdChange(lastSelectedChatId.current, true, true);
        if (chatId === -1) return;
        const chats = await ctx.snapshot.getPromise(chatsState.chats);
        if (!chats || !chats.includes(chatId)) return;
        const self = await ctx.snapshot.getPromise(
          chatsState.selfParticipantByChat(chatId)
        );
        if (!self || (!force && !self.toReadPings)) return;
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

  React.useEffect(() => {
    if (selectedChatId === lastSelectedChatId.current) return;
    onSelectedChatIdChange(selectedChatId);
    lastSelectedChatId.current = selectedChatId;
  }, [onSelectedChatIdChange, selectedChatId]);

  const updateParticipants = useRecoilCallback(
    (ctx) => async (ev: ChatsModel.Sse.UpdateParticipantEvent) => {
      const { type, chatId, participantId } = ev.data;
      const chats = await ctx.snapshot.getPromise(chatsState.chats);
      if (!chats || !chats.includes(chatId)) return;
      if (type === 'add') {
        const { participant } = ev.data;
        ctx.set(chatsState.participants(chatId), (prev) => {
          return [...prev, participant];
        });
        return;
      }
      const participants = await ctx.snapshot.getPromise(
        chatsState.participants(chatId)
      );
      if (!participants) return;
      const participantIdx = participants.findIndex(
        (p) => p.id === participantId
      );
      if (participantIdx === -1) return;
      ctx.set(
        chatsState.participant({
          chatId,
          participantId,
        }),
        (prev) => {
          if (type === 'remove') {
            const { banned } = ev.data;
            return {
              ...prev,
              role: banned
                ? ChatsModel.Models.ChatParticipantRole.Banned
                : ChatsModel.Models.ChatParticipantRole.Left,
            };
          }
          const { participant } = ev.data;
          const newP = { ...prev, ...participant };
          if (isEqual(newP, prev)) return prev;
          return newP;
        }
      );
      if (type === 'remove') {
        const self = await ctx.snapshot.getPromise(
          chatsState.selfParticipantByChat(chatId)
        );
        if (!self || self.id !== participantId) return;
        const selectedChatId = await ctx.snapshot.getPromise(
          chatsState.selectedChatId
        );
        if (chatId === selectedChatId) ctx.set(chatsState.selectedChatId, -1);
        ctx.set(chatsState.chats, (prev) =>
          prev.filter((cId) => cId !== chatId)
        );
        ctx.reset(chatsState.chat(chatId));
      }
    },
    []
  );

  useSseEvent<ChatsModel.Sse.NewMessageEvent>(
    ChatsModel.Sse.Events.NewMessage,
    onNewMessage
  );
  useSseEvent<ChatsModel.Sse.NewChatEvent>(
    ChatsModel.Sse.Events.NewChat,
    onNewChat
  );
  useSseEvent<ChatsModel.Sse.UpdateParticipantEvent>(
    ChatsModel.Sse.Events.UpdateParticipant,
    updateParticipants
  );
};

export default useMessagesService;

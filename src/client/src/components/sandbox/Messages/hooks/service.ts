import { useSseEvent } from '@hooks/sse';
import ChatsModel from '@typings/models/chat';
import { useRecoilCallback } from 'recoil';
import chatsState from '../state';

const useMessagesService = () => {
  const onNewMessage = useRecoilCallback(
    (ctx) => async (ev: ChatsModel.Sse.NewMessageEvent) => {
      const { data } = ev;
      const chats = await ctx.snapshot.getPromise(chatsState.chats);
      const chatIdx = chats.findIndex((chat) => chat.id === data.chatId);
      if (chatIdx === -1) return;
      const chat = { ...chats[chatIdx] };
      chat.messages = [data, ...chat.messages];
      chats[chatIdx] = chat;
      ctx.set(chatsState.chats, [...chats]);
    },
    []
  );
  useSseEvent<ChatsModel.Sse.NewMessageEvent>(
    ChatsModel.Sse.Events.NewMessage,
    onNewMessage
  );
};

export default useMessagesService;

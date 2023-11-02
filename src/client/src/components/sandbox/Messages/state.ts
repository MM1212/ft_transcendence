import { sessionAtom, usersAtom } from '@hooks/user/state';
import tunnel from '@lib/tunnel';
import ChatsModel from '@typings/models/chat';
import { atom, selector, selectorFamily, waitForAll } from 'recoil';

const Targets = ChatsModel.Endpoints.Targets;

const chatsState = new (class MessagesState {
  chats = atom<ChatsModel.Models.IChat[]>({
    key: 'chats',
    default: selector<ChatsModel.Models.IChat[]>({
      key: 'chats/selector',
      get: async () => {
        const resp = await tunnel.get(Targets.GetSessionChats);
        if (resp.status === 'error') throw new Error(resp.errorMsg);
        return resp.data.map((chat) => ({
          ...chat,
          authorizationData: null,
        }));
      },
    }),
  });
  chatIds = selector<number[]>({
    key: 'chatIds',
    get: ({ get }) =>
      get(this.chats)
        .sort((a, b) => {
          const aLast = a.messages[0]?.createdAt ?? 0;
          const bLast = b.messages[0]?.createdAt ?? 0;
          return bLast - aLast;
        })
        .map((c) => c.id),
  });
  selectedChatId = atom<number>({
    key: 'selectedChatId',
    default: selector<number>({
      key: 'selectedChatId/selector',
      get: ({ get }) => get(this.chatIds)[0] ?? -1,
    }),
  });
  selectedChat = selector<ChatsModel.Models.IChat>({
    key: 'selectedChat',
    get: ({ get }) => {
      const chatId = get(this.selectedChatId);
      const chat = get(this.chat(chatId));
      return chat;
    },
  });
  isChatSelected = selectorFamily<boolean, number>({
    key: 'isChatSelected',
    get:
      (id) =>
      ({ get }) =>
        get(this.selectedChatId) === id,
    set:
      (id) =>
      ({ set }) => {
        set(this.selectedChatId, id);
      },
  });
  chat = selectorFamily<ChatsModel.Models.IChat, number>({
    key: 'chat',
    get:
      (id) =>
      async ({ get }) => {
        const chats = get(this.chats);
        const chat = chats.find((c) => c.id === id);
        if (!chat) throw new Error('Chat not found');
        return chat;
      },
  });
  messages = selectorFamily<ChatsModel.Models.IChatMessage[], number>({
    key: 'chatMessages',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        return chat?.messages ?? [];
      },
  });
  participants = selectorFamily<ChatsModel.Models.IChatParticipant[], number>({
    key: 'chatParticipants',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        return chat?.participants ?? [];
      },
  });
  participant = selectorFamily<
    ChatsModel.Models.IChatParticipant | null,
    { chatId: number; participantId: number }
  >({
    key: 'chatParticipant',
    get:
      ({ chatId, participantId }) =>
      ({ get }) => {
        const chat = get(this.chat(chatId));
        return chat?.participants.find((p) => p.id === participantId) ?? null;
      },
  });
  participantIds = selectorFamily<number[], number>({
    key: 'chatParticipantIds',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        return chat?.participants.map((p) => p.id) ?? [];
      },
  });
  selfParticipantByChat = selectorFamily<
    ChatsModel.Models.IChatParticipant | null,
    number
  >({
    key: 'chatSelfParticipant',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        const self = get(sessionAtom);
        return chat?.participants.find((p) => p.userId === self?.id) ?? null;
      },
  });
  message = selectorFamily<
    ChatsModel.Models.IChatMessage | null,
    { chatId: number; messageId: number }
  >({
    key: 'chatMessage',
    get:
      ({ chatId, messageId }) =>
      ({ get }) => {
        const chat = get(this.chat(chatId));
        return chat?.messages.find((m) => m.id === messageId) ?? null;
      },
  });
  messageIds = selectorFamily<number[], number>({
    key: 'chatMessageIds',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        return chat?.messages.map((m) => m.id) ?? [];
      },
  });
  lastMessage = selectorFamily<ChatsModel.Models.IChatMessage | null, number>({
    key: 'chatLastMessage',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        return chat?.messages[0] ?? null;
      },
  });
  chatInfo = selectorFamily<ISelectedChatInfo, number>({
    key: 'chatInfo',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { messages, participants, authorizationData, ...info } = chat;
        const self = get(sessionAtom);
        const users = get(
          waitForAll(participants.map((p) => usersAtom(p.userId)))
        ).filter((u) => u !== null && u.id !== self?.id);
        if (info.type === ChatsModel.Models.ChatType.Direct) {
          const other = users[0];

          info.name = other?.nickname ?? 'Unknown';
          info.photo = other?.avatar ?? null;
          (info as ISelectedChatInfo).online = false;
        } else {
          (info as ISelectedChatInfo).participantNames = users
            .map((p) => p.nickname)
            .join(', ');
          const lastMessageParticipant = participants.find(
            (p) => p.id === chat.messages[0]?.authorId
          );
          const lastMessageUser = users.find(
            (u) => u.id === lastMessageParticipant?.userId
          );
          (info as ISelectedChatInfo).lastMessageAuthorName =
            lastMessageUser?.id === self?.id
              ? 'You'
              : lastMessageUser?.nickname ?? 'Unknown';
        }
        (info as ISelectedChatInfo).lastMessage = chat.messages[0] ?? null;
        return info as ISelectedChatInfo;
      },
  });
  selectedChatInfo = selector<ISelectedChatInfo>({
    key: 'selectedChatInfo',
    get: ({ get }) => {
      const chatId = get(this.selectedChatId);
      return get(this.chatInfo(chatId));
    },
  });
})();
interface ISelectedChatInfo extends ChatsModel.Models.IChatInfo {
  online: boolean;
  participantNames: string;
  lastMessage: ChatsModel.Models.IChatMessage | null;
  lastMessageAuthorName: string;
}

export default chatsState;

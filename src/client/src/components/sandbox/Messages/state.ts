import { sessionAtom, usersAtom } from '@hooks/user/state';
import tunnel from '@lib/tunnel';
import ChatsModel from '@typings/models/chat';
import UsersModel from '@typings/models/users';
import {
  DefaultValue,
  atom,
  atomFamily,
  selector,
  selectorFamily,
  waitForAll,
} from 'recoil';

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
      [...get(this.chats)]
        .sort((a, b) => {
          const aLast = a.messages[0]?.createdAt ?? 0;
          const bLast = b.messages[0]?.createdAt ?? 0;
          return bLast - aLast;
        })
        .map((c) => c.id),
  });
  selectedChatId = atom<number>({
    key: 'selectedChatId',
    default: -1,
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
    set:
      (id) =>
      ({ set }, newValue) => {
        if (newValue instanceof DefaultValue) return;
        set(this.chats, (prev) => {
          const idx = prev.findIndex((c) => c.id === id);
          if (idx === -1) return prev;
          const tmp = [...prev];
          tmp[idx] = newValue;
          return tmp;
        });
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
    set:
      (id) =>
      ({ set }, newValue) => {
        if (newValue instanceof DefaultValue) return;
        set(this.chat(id), (prev) => ({
          ...prev,
          messages: newValue,
        }));
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
    set:
      (id) =>
      ({ set }, newValue) => {
        if (newValue instanceof DefaultValue) return;
        set(this.chat(id), (prev) => ({
          ...prev,
          participants: newValue,
        }));
      },
  });
  participant = selectorFamily<
    ChatsModel.Models.IChatParticipant,
    { chatId: number; participantId: number }
  >({
    key: 'chatParticipant',
    get:
      ({ chatId, participantId }) =>
      ({ get }) => {
        const chat = get(this.chat(chatId));
        return chat.participants.find((p) => p.id === participantId)!;
      },
    set:
      ({ chatId, participantId }) =>
      ({ set }, newValue) => {
        if (newValue instanceof DefaultValue) return;
        set(this.participants(chatId), (prev) => {
          const idx = prev.findIndex((p) => p.id === participantId);
          if (idx === -1) return prev;
          const tmp = [...prev];
          tmp[idx] = newValue;
          return tmp;
        });
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
    ChatsModel.Models.IChatParticipant,
    number
  >({
    key: 'chatSelfParticipant',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        const self = get(sessionAtom);
        return chat.participants.find((p) => p.userId === self?.id)!;
      },
    set:
      (id) =>
      ({ set }, newValue) => {
        if (newValue instanceof DefaultValue) return;
        set(this.participant({ chatId: id, participantId: newValue.id }), {
          ...newValue,
          toReadPings: 0,
        });
      },
  });
  unreadPings = selector<number>({
    key: 'chatUnreadPings',
    get: ({ get }) => {
      const self = get(sessionAtom);
      const chats = get(this.chats);
      return chats.reduce((acc, chat) => {
        const participant = chat.participants.find(
          (p) => p.userId === self?.id
        );
        return acc + (participant?.toReadPings ?? 0);
      }, 0);
    },
  });
  messageByIdx = selectorFamily<
    ChatsModel.Models.IChatMessage | null,
    { chatId: number; messageIdx: number }
  >({
    key: 'chatMessage',
    get:
      ({ chatId, messageIdx }) =>
      ({ get }) => {
        const chat = get(this.chat(chatId));
        return chat?.messages[messageIdx] ?? null;
      },
  });
  message = selectorFamily<
    ChatsModel.Models.IChatMessage | null,
    { chatId: number; messageId: number }
  >({
    key: 'chatMessage',
    cachePolicy_UNSTABLE: {
      eviction: 'most-recent',
    },
    get:
      ({ chatId, messageId }) =>
      ({ get }) => {
        const chat = get(this.chat(chatId));
        return chat?.messages.find((m) => m.id === messageId) ?? null;
      },
  });
  messageInteractions = selectorFamily<
    IMessageInteraction,
    {
      chatId: number;
      messageIdx: number;
    }
  >({
    key: 'chatMessageInteractions',
    get:
      ({ chatId, messageIdx }) =>
      ({ get }) => {
        const message = get(this.messageByIdx({ chatId, messageIdx }))!;
        const prev = get(
          this.messageByIdx({ chatId, messageIdx: messageIdx + 1 })
        );
        const next = get(
          this.messageByIdx({ chatId, messageIdx: messageIdx - 1 })
        );
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
  });
  messageIds = selectorFamily<number[], number>({
    key: 'chatMessageIds',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        return [...(chat?.messages ?? [])].map((m) => m.id);
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
        ).filter(Boolean);
        if (info.type === ChatsModel.Models.ChatType.Direct) {
          const other = users.find((u) => u.id !== self?.id);

          info.name = other?.nickname ?? 'Unknown';
          info.photo = other?.avatar ?? null;
          (info as ISelectedChatInfo).status =
            other?.status ?? UsersModel.Models.Status.Offline;
        } else {
          (info as ISelectedChatInfo).participantNames = users
            .filter((u) => u?.id !== self?.id)
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

  chatsInput = atomFamily<string, number>({
    key: 'chatsInput',
    default: '',
  });
})();
interface ISelectedChatInfo extends ChatsModel.Models.IChatInfo {
  status: UsersModel.Models.Status;
  participantNames: string;
  lastMessage: ChatsModel.Models.IChatMessage | null;
  lastMessageAuthorName: string;
}

interface IMessageInteraction {
  prev: boolean;
  next: boolean;
}

export default chatsState;

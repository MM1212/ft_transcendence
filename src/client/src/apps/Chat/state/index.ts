import friendsState from '@apps/Friends/state';
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
  chats = atom<number[]>({
    key: 'chats',
    default: selector<number[]>({
      key: 'chats/selector',
      get: async () => {
        const chats = await tunnel.get(Targets.GetSessionChats);
        console.log('downloaded chats', chats);
        return chats;
      },
    }),
  });
  allChats = selector<ChatsModel.Models.IChat[]>({
    key: 'chats/all',
    get: ({ get }) => {
      return get(waitForAll(get(this.chats).map(this.chat)));
    },
  });
  searchFilter = atom<string>({
    key: 'chats/searchFilter',
    default: '',
  });
  filteredChatIds = selector<number[]>({
    key: 'chatIds',
    get: ({ get }) => {
      const search = get(this.searchFilter).toLowerCase();
      let chats = get(
        waitForAll(
          get(this.allChats)
            .filter((chat) => chat.type !== ChatsModel.Models.ChatType.Temp)
            .map((c) => this.chatInfo(c.id))
        )
      );
      if (search.trim().length)
        chats = chats.filter((c) => {
          const { lastMessage, name } = c;
          if (lastMessage?.message.toLowerCase().includes(search.toLowerCase()))
            return true;
          if (name.toLowerCase().includes(search.toLowerCase())) return true;
          return false;
        });
      else chats = [...chats];
      return chats
        .sort((a, b) => {
          const aLast = a.lastMessage?.createdAt ?? a.createdAt;
          const bLast = b.lastMessage?.createdAt ?? b.createdAt;
          return bLast - aLast;
        })
        .map((c) => c.id);
    },
  });
  selectedChatId = atom<number>({
    key: 'selectedChatId',
    default: -1,
  });
  selectedChat = selector<ChatsModel.Models.IChat | null>({
    key: 'selectedChat',
    get: ({ get }) => {
      const chatId = get(this.selectedChatId);
      if (chatId === -1) return null;
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
  chat = atomFamily<ChatsModel.Models.IChat, number>({
    key: 'chat',
    default: selectorFamily<ChatsModel.Models.IChat, number>({
      key: 'chat/selector',
      get: (id) => async () => {
        try {
          const chat: ChatsModel.Models.IChat = (await tunnel.get(
            Targets.GetChat,
            {
              chatId: id,
            }
          )) as ChatsModel.Models.IChat;
          chat.authorizationData = null;
          return chat;
        } catch (e) {
          return null as any;
        }
      },
    }),
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
  activeParticipants = selectorFamily<
    ChatsModel.Models.IChatParticipant[],
    number
  >({
    key: 'chatActiveParticipants',
    cachePolicy_UNSTABLE: {
      eviction: 'most-recent',
    },
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        return (
          chat?.participants.filter((p) => {
            switch (p.role) {
              case ChatsModel.Models.ChatParticipantRole.Banned:
              case ChatsModel.Models.ChatParticipantRole.Left:
                return false;
              default:
                return true;
            }
          }) ?? []
        );
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
        if (!chat) return null as any;
        const self = get(sessionAtom);
        return chat.participants.find((p) => p.userId === self?.id)!;
      },
    set:
      (id) =>
      ({ set }, newValue) => {
        if (newValue instanceof DefaultValue) return;
        set(
          this.participant({ chatId: id, participantId: newValue.id }),
          newValue
        );
      },
  });
  isParticipantBlocked = selectorFamily<
    {
      blocked: boolean;
      muted: boolean;
    },
    {
      chatId: number;
      participantId: number;
    }
  >({
    key: 'chatIsParticipantBlocked',
    get:
      ({ chatId, participantId }) =>
      ({ get }) => {
        const self = get(chatsState.selfParticipantByChat(chatId));
        if (self.id === participantId) return { blocked: false, muted: false };
        const participant = get(
          chatsState.participant({ chatId, participantId })
        );
        const blocked = get(friendsState.blocked);
        return {
          blocked: blocked.includes(participant.userId),
          muted:
            participant.muted !== ChatsModel.Models.ChatParticipantMuteType.No,
        };
      },
  });
  isTargetRecipientBlocked = selectorFamily<boolean, number>({
    key: 'chatIsTargetRecipientBlocked',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        if (chat.type !== ChatsModel.Models.ChatType.Direct) return false;
        const self = get(sessionAtom);
        const other = chat.participants.find((p) => p.userId !== self?.id);
        if (!other) throw new Error('Direct chat without other participant');
        const blocked = get(friendsState.blocked);
        return blocked.includes(other.userId);
      },
  });
  participantsWithNameTyping = selectorFamily<string, number>({
    key: 'chatParticipantsWithNameTyping',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        const self = get(sessionAtom);
        const others = chat.participants.filter(
          (p) => p.userId !== self?.id && p.typing
        );
        if (others.length === 0) return '';
        const users = get(waitForAll(others.map((p) => usersAtom(p.userId))));
        const names = users.map((u) => u?.nickname ?? 'Unknown').join(', ');

        return `${names} ${others.length === 1 ? 'is' : 'are'} typing`;
      },
  });
  unreadPings = selector<number>({
    key: 'chatUnreadPings',
    get: ({ get }) => {
      const self = get(sessionAtom);
      const chats = get(this.allChats);
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
  cachedChatInfo = atomFamily<ChatsModel.Models.IChatInfo | null, number>({
    key: 'chatInfo/cached',
    default: null,
  });
  chatInfo = selectorFamily<ISelectedChatInfo, number>({
    key: 'chatInfo',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        if (!chat) return { deleted: true } as any;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { messages, participants, authorizationData, ...info } = chat;
        const self = get(sessionAtom);
        (info as ISelectedChatInfo).lastMessage = chat.messages[0] ?? null;
        if (info.type === ChatsModel.Models.ChatType.Direct) {
          const otherParticipant = participants.find(
            (p) => p?.userId !== self?.id
          );
          if (!otherParticipant)
            throw new Error('Direct chat without other participant');
          const other = get(usersAtom(otherParticipant.userId))!;
          info.name = other.nickname ?? 'Unknown';
          info.photo = other.avatar ?? null;
          (info as ISelectedChatInfo).status =
            other.status ?? UsersModel.Models.Status.Offline;
          if (
            chat.messages[0] &&
            chat.messages[0].authorId !== otherParticipant.id
          )
            (info as ISelectedChatInfo).lastMessageAuthorName = 'You';
        } else {
          (info as ISelectedChatInfo).participantCount = get(
            this.activeParticipants(id)
          ).length;
          if (chat.messages[0]) {
            const lastMessageParticipant = participants.find(
              (p) => p.id === chat.messages[0]?.authorId
            );
            if (!lastMessageParticipant)
              throw new Error('Message without author participant');
            const lastMessageUser = get(
              usersAtom(lastMessageParticipant.userId)
            );

            (info as ISelectedChatInfo).lastMessageAuthorName =
              lastMessageUser?.id === self?.id
                ? 'You'
                : lastMessageUser?.nickname ?? 'Unknown';
          }
        }
        return info as ISelectedChatInfo;
      },
  });
  participantNames = selectorFamily<string, number>({
    key: 'chatParticipantNames',
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        if (chat.type !== ChatsModel.Models.ChatType.Group) return '';
        const participants = get(this.activeParticipants(id));
        const self = get(sessionAtom);
        const first4 = participants
          .filter((p) => p.userId !== self?.id)
          .slice(0, 4);
        const users = get(waitForAll(first4.map((p) => usersAtom(p.userId))));
        const names = (
          users.filter(Boolean) as UsersModel.Models.IUserInfo[]
        ).map((p) => p.nickname);
        names.push('You');
        let str = names.join(', ');
        if (first4.length < participants.length - 1)
          str += ` and ${participants.length - 1 - first4.length} more`;
        return str;
      },
  });
  selectedChatInfo = selector<ISelectedChatInfo>({
    key: 'selectedChatInfo',
    get: ({ get }) => {
      const chatId = get(this.selectedChatId);
      return get(this.chatInfo(chatId));
    },
  });
  chatType = selectorFamily<ChatsModel.Models.ChatType, number>({
    key: 'chatType',
    cachePolicy_UNSTABLE: {
      eviction: 'most-recent',
    },
    get:
      (id) =>
      ({ get }) => {
        const chat = get(this.chat(id));
        return (
          (chat?.type as ChatsModel.Models.ChatType) ??
          ChatsModel.Models.ChatType.Direct
        );
      },
  });

  chatsInput = atomFamily<string, number>({
    key: 'chatsInput',
    default: '',
  });
})();
export interface ISelectedChatInfo
  extends Omit<
    ChatsModel.Models.IChatInfo,
    'messages' | 'participants' | 'authorizationData'
  > {
  status: UsersModel.Models.Status;
  lastMessage: ChatsModel.Models.IChatMessage | null;
  lastMessageAuthorName: string;
  participantCount: number;
}

interface IMessageInteraction {
  prev: boolean;
  next: boolean;
}

export default chatsState;

import { ChatModel } from '@typings/models';
import UsersModel from '@typings/models/users';

export const sampleUsers: UsersModel.Models.IUserInfo[] = [
  {
    id: 2,
    studentId: 95303,
    nickname: 'Antonio Maria',
    avatar:
      'https://cdn.intra.42.fr/users/7a6f505ef289bbba5827cb9a540b36d5/amaria-d.jpg',
    createdAt: 34 | 2,
    status: UsersModel.Models.Status.Online,
  },
  {
    id: 3,
    studentId: 95303,
    nickname: 'Rafilipe',
    avatar:
      'https://cdn.intra.42.fr/users/f4205b7a140dd61a72312e1a88b9f719/rafilipe.jpg',
    createdAt: 34 | 2,
    status: UsersModel.Models.Status.Online,
  },
  {
    id: 4,
    studentId: 95303,
    nickname: 'Sofia Valente',
    avatar:
      'https://cdn.intra.42.fr/users/ac03ffd19fa1c6de6bafeee0faedcd94/svalente.jpg',
    createdAt: 34 | 2,
    status: UsersModel.Models.Status.Offline,
  },
  {
    id: 5,
    studentId: 104676,
    nickname: 'Eugen Elisarow',
    avatar:
      'https://cdn.intra.42.fr/users/53eb389a91aec6756217abcbe39fa70a/eelisaro.jpg',
    createdAt: 34 | 2,
    status: UsersModel.Models.Status.Online,
  },
  {
    id: 10,
    studentId: 104676,
    nickname: 'Madalena Morais',
    avatar:
      'https://cdn.intra.42.fr/users/5e8e5c84280b646794f5c7a6352a3c47/msilva-c.jpg',
    createdAt: 34 | 2,
    status: UsersModel.Models.Status.Online,
  },
];

export const samplePendingFriends: UsersModel.Models.IUserInfo[] = [
  {
    id: 6,
    studentId: 104676,
    nickname: 'Ahmed Saadaway',
    avatar:
      'https://cdn.intra.42.fr/users/9cfee39201ad07775f72bc02b1b300e6/asaadawe.jpg',
    createdAt: 34 | 2,
    status: UsersModel.Models.Status.Online,
  },
  {
    id: 7,
    studentId: 95303,
    nickname: 'Remi Fabre',
    avatar:
      'https://cdn.intra.42.fr/users/4c00b0f2ac4d08e5e0db7c2e053a92e4/rfabre.jpg',
    createdAt: 34 | 2,
    status: UsersModel.Models.Status.Online,
  },
  {
    id: 8,
    studentId: 95303,
    nickname: 'Arwen',
    avatar:
      'https://cdn.intra.42.fr/users/2c38609113114d25e65fe5ee487b930e/aelazegu.jpg',
    createdAt: 34 | 2,
    status: UsersModel.Models.Status.Online,
  },
  {
    id: 9,
    studentId: 95303,
    nickname: 'Sofia Valente',
    avatar:
      'https://cdn.intra.42.fr/users/ac03ffd19fa1c6de6bafeee0faedcd94/svalente.jpg',
    createdAt: 34 | 2,
    status: UsersModel.Models.Status.Online,
  },
];

export const sampleParticipant: ChatModel.Models.IChatParticipant = {
  id: 1,
  chatId: 1,
  userId: sampleUsers[0].id,
  role: ChatModel.Models.ChatParticipantRole.Owner,
  toReadPings: 2,
  createdAt: 0,
};

export const sampleParticipantAntonio: ChatModel.Models.IChatParticipant = {
  id: 3,
  chatId: 1,
  userId: sampleUsers[1].id,
  role: ChatModel.Models.ChatParticipantRole.Member,
  toReadPings: 2,
  createdAt: 0,
};

export const sampleChat: ChatModel.Models.IChat = {
  id: 1,
  type: ChatModel.Models.ChatType.Direct,
  authorization: ChatModel.Models.ChatAccess.Private,
  authorizationData: null,
  name: 'priv: Mario+Joao',
  topic: '',
  photo: null,
  participants: [sampleParticipant, sampleParticipantAntonio],
  createdAt: 0,
  messages: [
    {
      id: 1,
      chatId: 1,
      type: ChatModel.Models.ChatMessageType.Normal,
      message: 'Eu sou o mario',
      meta: {},
      authorId: sampleParticipant.id,
      createdAt: 9.09,
    },
    {
      id: 3,
      chatId: 1,
      type: ChatModel.Models.ChatMessageType.Normal,
      message: 'Eu sou o Anfreire',
      meta: {},
      authorId: sampleParticipantAntonio.id,
      createdAt: 9.1,
    },
  ],
};

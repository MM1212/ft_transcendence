import { ChatModel } from "@typings/models";
import { IUser } from "@typings/user";

export const myAchievements: string[] = [
  "https://cdn-icons-png.flaticon.com/512/4047/4047954.png",
  "https://cdn-icons-png.flaticon.com/512/8744/8744961.png",
  "https://cdn-icons-png.flaticon.com/512/8683/8683795.png",
  "https://cdn-icons-png.flaticon.com/512/8744/8744961.png",
  "https://cdn-icons-png.flaticon.com/512/4047/4047954.png",
  "https://cdn-icons-png.flaticon.com/512/8744/8744961.png",
  "https://cdn-icons-png.flaticon.com/512/8744/8744961.png",
  "https://cdn-icons-png.flaticon.com/512/8744/8744961.png",
];

export const backGroundImg =
  "https://png.pngtree.com/thumb_back/fh260/background/20200714/pngtree-modern-double-color-futuristic-neon-background-image_351866.jpg";

//   "https://png.pngtree.com/thumb_back/fh260/background/20200731/pngtree-blue-carbon-background-with-sport-style-and-golden-light-image_371487.jpg";

export const sampleUsers: IUser[] = [
  {
    id: 2,
    studentId: 95303,
    nickname: "Antonio Maria",
    avatar:
      "https://cdn.intra.42.fr/users/7a6f505ef289bbba5827cb9a540b36d5/amaria-d.jpg",
    createdAt: 34 | 2,
    online: true,
    experience: "lvl 1000 4xp",
  },
  {
    id: 3,
    studentId: 95303,
    nickname: "Rafilipe",
    avatar:
      "https://cdn.intra.42.fr/users/f4205b7a140dd61a72312e1a88b9f719/rafilipe.jpg",
    createdAt: 34 | 2,
    online: true,
    experience: "lvl 1000 4xp",
  },
  {
    id: 4,
    studentId: 95303,
    nickname: "Sofia Valente",
    avatar:
      "https://cdn.intra.42.fr/users/ac03ffd19fa1c6de6bafeee0faedcd94/svalente.jpg",
    createdAt: 34 | 2,
    online: false,
    experience: "lvl 1000 4xp",
  },
  {
    id: 5,
    studentId: 104676,
    nickname: "Eugen Elisarow",
    avatar:
      "https://cdn.intra.42.fr/users/53eb389a91aec6756217abcbe39fa70a/eelisaro.jpg",
    createdAt: 34 | 2,
    online: true,
    experience: "lvl 9 5000xp",
  },
  {
    id: 10,
    studentId: 104676,
    nickname: "Madalena Morais",
    avatar:
      "https://cdn.intra.42.fr/users/5e8e5c84280b646794f5c7a6352a3c47/msilva-c.jpg",
    createdAt: 34 | 2,
    online: true,
    experience: "lvl 9 5000xp",
  },
];

export const samplePendingFriends: IUser[] = [
  {
    id: 6,
    studentId: 104676,
    nickname: "Ahmed Saadaway",
    avatar:
      "https://cdn.intra.42.fr/users/9cfee39201ad07775f72bc02b1b300e6/asaadawe.jpg",
    createdAt: 34 | 2,
    online: true,
    experience: "lvl 9 5000xp",
  },
  {
    id: 7,
    studentId: 95303,
    nickname: "Remi Fabre",
    avatar:
      "https://cdn.intra.42.fr/users/4c00b0f2ac4d08e5e0db7c2e053a92e4/rfabre.jpg",
    createdAt: 34 | 2,
    online: true,
    experience: "lvl 1000 4xp",
  },
  {
    id: 8,
    studentId: 95303,
    nickname: "Arwen",
    avatar:
      "https://cdn.intra.42.fr/users/2c38609113114d25e65fe5ee487b930e/aelazegu.jpg",
    createdAt: 34 | 2,
    online: true,
    experience: "lvl 1000 4xp",
  },
  {
    id: 9,
    studentId: 95303,
    nickname: "Sofia Valente",
    avatar:
      "https://cdn.intra.42.fr/users/ac03ffd19fa1c6de6bafeee0faedcd94/svalente.jpg",
    createdAt: 34 | 2,
    online: false,
    experience: "lvl 1000 4xp",
  },
];

export const sampleParticipant: ChatModel.Models.IChatParticipant = {
  id: 1,
  chatId: 1,
  user: sampleUsers[0],
  userId: sampleUsers[0].id,
  role: ChatModel.Models.ChatParticipantRole.Owner,
  toReadPings: 2,
  createdAt: 0,
};

export const sampleParticipantAntonio: ChatModel.Models.IChatParticipant = {
  id: 3,
  chatId: 1,
  user: sampleUsers[1],
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
  name: "priv: Mario+Joao",
  photo: null,
  participants: [sampleParticipant, sampleParticipantAntonio],
  createdAt: 0,
  messages: [
    {
      id: 1,
      chatId: 1,
      type: ChatModel.Models.ChatMessageType.Normal,
      message: "Eu sou o mario",
      meta: {},
      author: sampleParticipant,
      authorId: sampleParticipant.id,
      createdAt: 9.09,
    },
    {
      id: 3,
      chatId: 1,
      type: ChatModel.Models.ChatMessageType.Normal,
      message: "Eu sou o Anfreire",
      meta: {},
      author: sampleParticipantAntonio,
      authorId: sampleParticipantAntonio.id,
      createdAt: 9.1,
    },
  ],
};

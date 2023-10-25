import { IUser } from "@typings/user";
import MessagesPanel from "./components/MessagesPanel";
import MessageChat from "./components/MessageChat";
import ChatModel from "@typings/models/chat";

export interface ChatsPaneProps {
  chats: ChatModel.Models.IChat[];
  setSelectedChat: (chat: ChatModel.Models.IChat) => void;
}

export const sampleUsers: IUser[] = [
  {
    id: 1,
    studentId: 1,
    nickname: "Mário Granate",
    avatar: "https://avatars.githubusercontent.com/u/63326242?s=96&v=4",
    createdAt: 34 | 2,
    online: true,
  },
  {
    id: 2,
    studentId: 2,
    nickname: "Antonio Maria",
    avatar: "https://avatars.githubusercontent.com/u/63326242?s=96&v=4",
    createdAt: 34 | 2,
    online: true,
  },
];

export const sampleParticipant: ChatModel.Models.IChatParticipant = {
  id: 0,
  chatId: 1,
  user: sampleUsers[0],
  userId: sampleUsers[0].id,
  role: ChatModel.Models.ChatParticipantRole.Owner,
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
  participants: [sampleParticipant],
  createdAt: 0,
  messages: [
    {
      id: 0,
      chatId: 1,
      type: ChatModel.Models.ChatMessageType.Normal,
      message: "BOAS",
      meta: {},
      author: sampleParticipant,
      authorId: sampleParticipant.id,
      createdAt: Math.floor(Date.now() - Math.random() * 1000),
    },
  ],
  // messages: [...new Array(20)].map((_,id) => {
  //   const author = id % 2 === 0 ? sampleUsers[0] : sampleUsers[1];
  //   return ({
  //     id,
  //     author: {
  //       chatId: id,
  //       createdAt: Date.now(),
  //       id: id * 2,
  //       role: ChatModel.Models.ChatParticipantRole.Banned,
  //       toReadPings: 2,
  //       user: author,
  //       userId: author.id
  //     },
  //     authorId: id,
  //     chatId: 1,
  //     createdAt: Math.floor(Date.now() - Math.random() * 1000),
  //     message: "BOAS",
  //     meta: {},
  //     type: ChatModel.Models.ChatMessageType.Normal
  //   });
  // }),
};

export const arrayChats: ChatModel.Models.IChat[] = [sampleChat];

export const targets = [
  {
    label: "Home",
    target: "",
  },
  {
    label: "Settings",
    target: "/settings",
  },
  {
    label: "Messages",
    target: "/messages",
    node: (
      <>
        <MessagesPanel chats={arrayChats} setSelectedChat={() => {}}/>
        <MessageChat chat={sampleChat} me={sampleUsers[0]} />
      </>
    ),
  },
  {
    label: "Key Bindings",
    target: "/keybindings",
  },
  {
    label: "Friends",
    target: "/friends",
  },
  {
    label: "Achievements",
    target: "/achievements",
  },
  {
    label: "Exit",
    target: "/exit",
  },
];

export function myAssert(condition: boolean) {
  if (!condition)
    throw new Error("myAssertion failed");
}
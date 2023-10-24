import { IUser } from "@typings/user";
import MessagesPanel from "./components/MessagesPanel";
import MessageChat from "./components/MessageChat";

export type MessageProps = {
  id: string;
  content: string;
  timestamp: string;
  sender: IUser;
  unread?: boolean;
  attachment?: {
    fileName: string;
    type: string;
    size: string;
  };
};

export type ChatProps = {
  id: string;
  sender: IUser;
  messages: MessageProps[];
};

const userProps: IUser[] = [
  {
    id: 1,
    studentId: 1,
    nickname: "Mário Granate",
    avatar: "https://avatars.githubusercontent.com/u/63326242?s=96&v=4",
    createdAt: 34 | 2,
    online: false,
  },
  {
    id: 2,
    studentId: 2,
    nickname: "Him",
    avatar: "https://avatars.githubusercontent.com/u/63326242?s=96&v=4",
    createdAt: 34 | 2,
    online: true,
  },
];

export const arrayChats: ChatProps[] = [
  {
    id: "1",
    sender: userProps[0],
    messages: [
      {
        id: "1",
        content: "Hello",
        timestamp: "Wednesday 11:19am",
        sender: userProps[0],
      },
      {
        id: "1",
        content: "How are you?",
        timestamp: "Wednesday 11:20am",
        sender: userProps[0],
      },
      {
        id: "2",
        content: "Hello John",
        timestamp: "Wednesday 11:21am",
        sender: userProps[1],
      },
      {
        id: "2",
        content: "I am good and you?",
        timestamp: "Wednesday 11:22am",
        sender: userProps[1],
      },
    ],
  },
];
export type ChatsPaneProps = {
  chats: ChatProps[];
  setSelectedChat: (chat: ChatProps) => void;
  selectedChatId: string;
};

export const chatMessages: ChatProps = {
  id: "1",
  sender: userProps[0],
  messages: [
    {
      id: "1",
      content: "Hello",
      timestamp: "Wednesday 11:19am",
      sender: userProps[0],
    },
    {
      id: "1",
      content: "How are you?",
      timestamp: "Wednesday 11:20am",
      sender: userProps[0],
    },
    {
      id: "2",
      content: "Hello John",
      timestamp: "Wednesday 11:21am",
      sender: userProps[1],
    },
    {
      id: "2",
      content: "I am good and you?",
      timestamp: "Wednesday 11:22am",
      sender: userProps[1],
    },
  ],
};

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
        <MessagesPanel
          chats={arrayChats}
          setSelectedChat={() => {}}
          selectedChatId={"1"}
        />
        <MessageChat chat={chatMessages} />
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

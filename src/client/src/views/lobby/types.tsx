import MessagesPanel from "./components/MessagesPanel";
import MessageChat from "./components/MessageChat";
import ChatModel from "@typings/models/chat";
import FriendsPanel from "./components/FriendsPanel";
import { sampleChat } from "./hardoceTestes";
import Profile from "./components/user/Profile";

export interface ChatsPaneProps {
  setSelectedChat: (chat: ChatModel.Models.IChat) => void;
}
export function formatTimestamp(timestamp: Date) {
  const date = timestamp;
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = daysOfWeek[date.getDay()];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  const fromattedTimestamp = `${dayOfWeek} ${formattedHours}:${formattedMinutes}${ampm}`;

  return fromattedTimestamp;
}

export const arrayChats: ChatModel.Models.IChat[] = [sampleChat];


export const mainTargets = [
  {
    label: "Home",
    target: "/",
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
        <MessagesPanel setSelectedChat={() => {}} />
        <MessageChat chat={sampleChat} />
      </>
    ),
  },
  {
    label: "Key Bindings",
    target: "/keybindings",
  },
  {
    label: "Friends",
    route: "/friends/:rest*",
    target: "/friends",
    node: (
      <>
        <FriendsPanel />
      </>
    ),
  },
  {
    label: "Achievements",
    target: "/achievements",
  },
  {
    label: "Profile",
    target: "/profile",
    node: (
      <>
        <Profile />
      </>
    )
  },
  {
    label: "Exit",
    target: "/exit",
  },
];
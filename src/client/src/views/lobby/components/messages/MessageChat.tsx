import { Sheet } from "@mui/joy";
import ChatBubble from "./BubbleChat";
import { Box } from "@mui/joy";
import { Stack } from "@mui/joy";
import AvatarWithStatus from "../AvatarWithStatusProps";
import ChatHeader from "./ChatHeader";
import React from "react";
import MessageInput from "./MessageTyping";
import ChatModel from "@typings/models/chat";
import { useRecoilState } from "recoil";
import { sessionAtom } from "@hooks/user";

export interface myChat {
  chat: ChatModel.Models.IChat;
}

export function MessageChat({ chat }: myChat) {
  //  const [chatMessages, setChatMessages] = useRecoilState(chatsState);
  //   setChats({ ...chats, ...sampleChat });
  const [chatMessages, setChatMessages] = React.useState(chat.messages);
  //   const { user } = useSession();
  const [me, setMe] = useRecoilState(sessionAtom);
  const user = me;

  console.log("User:", user);
  if (!user) return null;
  const addNewMessage = (newMessage: ChatModel.Models.IChatMessage) => {
    setChatMessages([...chatMessages, newMessage]);
  };
  return (
    <Sheet
      sx={{
        height: { xs: "calc(100dvh - var(--Header-height))", lg: "100dvh" },
        display: "flex",
        flexDirection: "column",
        width: "70%",
        backgroundColor: "background.level1",
      }}
    >
      <ChatHeader chat={chat} />
      <Box
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          px: 2,
          py: 3,
          overflowY: "scroll",
          flexDirection: "column-reverse",
        }}
      >
        <Stack spacing={2} justifyContent="flex-end">
          {chatMessages.map(
            (message: ChatModel.Models.IChatMessage, index: number) => {
              const isYou = message.author.user.id === user.id; //This id does not represent the user
              return (
                <Stack
                  key={index}
                  direction="row"
                  spacing={2}
                  flexDirection={isYou ? "row-reverse" : "row"}
                >
                  {message.author.user.id !== user.id && (
                    <AvatarWithStatus
                      online={message.author.user?.online}
                      src={message.author.user.avatar}
                    />
                  )}
                  <ChatBubble bubMessage={message} me={user} />
                </Stack>
              );
            }
          )}
        </Stack>
      </Box>
      <MessageInput
        chatMessages={chatMessages}
        addMessage={addNewMessage}
        chat={chat}
      />
    </Sheet>
  );
}

export default MessageChat;
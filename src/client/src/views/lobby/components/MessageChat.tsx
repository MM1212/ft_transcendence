import { Sheet } from "@mui/joy";
import ChatBubble from "./BubbleChat";
import { Box } from "@mui/joy";
import { Stack } from "@mui/joy";
import AvatarWithStatus from "./AvatarWithStatusProps";
import ChatHeader from "./ChatHeader";
import React from "react";
import MessageInput from "./MessageTyping";
import ChatModel from "@typings/models/chat"
import { IUser } from "@typings/user";
import { myAssert, sampleParticipant } from "../types";

export interface myChat {
  chat: ChatModel.Models.IChat,
  me: IUser,
}

export default function MessageChat({chat, me}: myChat) 
{
  const [chatMessages, setChatMessages] = React.useState(chat.messages);
  // const [textAreaValue, setTextAreaValue] = React.useState("");

  React.useEffect(() => {
    setChatMessages(chat.messages);
  }, [chat.messages]);

  myAssert(chat.participants.length > 0);
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
      <ChatHeader sender={chat.participants[0]} />
      {/* <Box
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
          {chatMessages.map((message: ChatModel.Models.IChatMessage, index: number) => {
            const isYou = message.id === 1;
            return (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                flexDirection={isYou ? "row-reverse" : "row"}
              >
                {message.id !== 1 && (
                  <AvatarWithStatus
                    online={message.author.user?.online}
                    src={message.author.user.avatar}
                  />
                )}
                <ChatBubble
                  bubMessage={message}
                  me={me}
                />
              </Stack>
            );
          })}
        </Stack>
      </Box> */}
      <MessageInput
        // textAreaValue={textAreaValue}
        // setTextAreaValue={setTextAreaValue}
        // onSubmit={() => {
        //   const newId = chatMessages.length + 1;
        //   const newIdString = newId.toString();
        //   setChatMessages([
        //     ...chatMessages,
        //     {
        //       id: me.id,
        //       chatId: 200,
        //       type: ChatModel.Models.ChatMessageType.Normal,
        //       message: textAreaValue,
        //       meta: {},
        //       author: sampleParticipant,
        //       authorId: sampleParticipant.id,
        //       createdAt: 0
        //     }
        //   ]);
        // }}
      />
    </Sheet>
  );
}

import { Sheet } from "@mui/joy";
import ChatBubble from "./BubbleChat";
import { Box } from "@mui/joy";
import { Stack } from "@mui/joy";
import AvatarWithStatus from "./AvatarWithStatusProps";
import { ChatProps, MessageProps } from "../types";
import ChatHeader from "./ChatHeader";
import React from "react";
import MessageInput from "./MessageTyping";

type MessagesPaneProps = {
  chat: ChatProps;
};

export default function MessagesPanel({ chat }: MessagesPaneProps) {
  const [chatMessages, setChatMessages] = React.useState(chat.messages);
  const [textAreaValue, setTextAreaValue] = React.useState("");

  React.useEffect(() => {
    setChatMessages(chat.messages);
  }, [chat.messages]);

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
      <ChatHeader sender={chat.sender} />
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
          {chatMessages.map((message: MessageProps, index: number) => {
            const isYou = message.id === "1";
            return (
              <Stack
                key={index}
                direction="row"
                spacing={2}
                flexDirection={isYou ? "row-reverse" : "row"}
              >
                {message.id !== "1" && (
                  <AvatarWithStatus
                    online={message.sender.online}
                    src={message.sender.avatar}
                  />
                )}
                <ChatBubble
                  variant={isYou ? "sent" : "received"}
                  {...message}
                />
              </Stack>
            );
          })}
        </Stack>
      </Box>
      <MessageInput
        textAreaValue={textAreaValue}
        setTextAreaValue={setTextAreaValue}
        onSubmit={() => {
          const newId = chatMessages.length + 1;
          const newIdString = newId.toString();
          setChatMessages([
            ...chatMessages,
            {
              id: newIdString,
              sender: chat.sender,
              content: textAreaValue,
              timestamp: "Just now",
            },
          ]);
        }}
      />
    </Sheet>
  );
}

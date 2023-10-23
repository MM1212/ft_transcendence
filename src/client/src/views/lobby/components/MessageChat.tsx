import { Sheet } from "@mui/joy";
import ChatBubble from "./BubbleChat";
import { Box } from "@mui/joy";
import { Stack } from "@mui/joy";

type MessagesPanelProps = {
  isOpen: boolean;
};

export type UserProps = {
  name: string;
  username: string;
  avatar: string;
  online: boolean;
};

export type MessageProps = {
  id: string;
  content: string;
  timestamp: string;
  unread?: boolean;
  sender: UserProps;
  attachment?: {
    fileName: string;
    type: string;
    size: string;
  };
};

type ChatMessage = {
  message: MessageProps;
};

const userProps: UserProps[] = [
  {
    name: "You",
    username: "you",
    avatar: "https://i.imgur.com/6VBx3io.png",
    online: true,
  },
  {
    name: "Him",
    username: "him",
    avatar: "https://i.imgur.com/6VBx3io.png",
    online: true,
  },
  {
    name: "Him",
    username: "him",
    avatar: "https://i.imgur.com/6VBx3io.png",
    online: true,
  },
];

const chatMessages: ChatMessage[] = [
  {
    message: {
      id: "key1",
      content: "Hello",
      timestamp: "2023-10-23T12:00:00Z",
      sender: userProps[0],
    },
  },
  {
    message: {
      id: "key2",
      content: "How are you?",
      timestamp: "2023-10-23T12:15:00Z",
      sender: userProps[1],
    },
  },
  {
    message: {
      id: "key3",
      content: "Fine, thank you!",
      timestamp: "2023-10-23T12:30:00Z",
      sender: userProps[2],
    },
  },
  // Add more messages as needed
];

// Example data for MessageProps
export default function MessagesPanel({ isOpen }: MessagesPanelProps) {
  if (isOpen)
    return (
      <Sheet
        sx={{
          borderRight: "1px solid",
          borderColor: "divider",
          height: "calc(100dvh - var(--Header-height))",
          overflowY: "auto",
          width: "100%",
          backgroundColor: "background.level2",
        }}
      >
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
            {chatMessages.map(({ message }: ChatMessage, index: number) => {
              const isYou = message.sender.name === "You";
              return (
                <Stack
                  key={index}
                  direction="row"
                  spacing={2}
                  flexDirection={isYou ? "row-reverse" : "row"}
                >
                  <ChatBubble
                    variant={isYou ? "sent" : "received"}
                    {...message}
                  />
                </Stack>
              );
            })}
          </Stack>
        </Box>
      </Sheet>
    );
}

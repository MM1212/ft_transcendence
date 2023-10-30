import * as React from "react";
import Box from "@mui/joy/Box";
import ListDivider from "@mui/joy/ListDivider";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { ListItemButtonProps } from "@mui/joy/ListItemButton";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { sampleChat } from "../types";
import { toggleMessagesPane } from "../utils";
import AvatarWithStatus from "./AvatarWithStatusProps";
import { ChatModel } from "@typings/models";
import { useSession } from "@hooks/user";
import { Avatar } from "@mui/joy";

type ChatListItemProps = ListItemButtonProps & {
  chat: ChatModel.Models.IChat;
  setSelectedChat: (chat: ChatModel.Models.IChat) => void;
};

export default function ChatListItem({
  chat,
  setSelectedChat,
}: ChatListItemProps) {
  console.log("Chat:", chat);
  const { user } = useSession();
  if (!user) return null;

  let avatarSrc: string;
  let chatName: string;

  const whoIAmTalkingTo: ChatModel.Models.IChatParticipant | undefined =
    chat.participants.find((e) => e.user.id !== user.id);
  if (!whoIAmTalkingTo) return null;
  if (chat.type === ChatModel.Models.ChatType.Group) {
    chatName = chat.name;
    avatarSrc = chat.photo || whoIAmTalkingTo.user.avatar; //Put default Image not this one
  } else {
    chatName = whoIAmTalkingTo.user.nickname;
    avatarSrc = whoIAmTalkingTo.user.avatar;
  }

  return (
    <React.Fragment>
      <ListItem>
        <ListItemButton
          onClick={() => {
            toggleMessagesPane();
            setSelectedChat(sampleChat);
          }}
          // selected={selected}
          color="neutral"
          sx={{
            flexDirection: "column",
            alignItems: "initial",
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1.5}>
            {chat.type === ChatModel.Models.ChatType.Group ? (
              <Avatar size="lg" src={avatarSrc} />
            ) : (
              <AvatarWithStatus
                online={whoIAmTalkingTo.user.online}
                src={avatarSrc}
              />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography level="title-sm">{chatName}</Typography>
              <Typography level="body-sm">
                {whoIAmTalkingTo.user?.experience}
              </Typography>
            </Box>
            <Box
              sx={{
                lineHeight: 1.5,
                textAlign: "right",
              }}
            >
              {/* {messages[0].unread && (
                <Badge sx={{ fontSize: 12 }} color="primary" />
              )} */}
              <Typography
                level="body-xs"
                display={{ xs: "none", md: "block" }}
                noWrap
              >
                5 mins ago
              </Typography>
            </Box>
          </Stack>
          <Typography
            level="body-sm"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {chat.messages[chat.messages.length - 1].message}
          </Typography>
        </ListItemButton>
      </ListItem>
      <ListDivider sx={{ margin: 0 }} />
    </React.Fragment>
  );
}

import * as React from "react";
import Box from "@mui/joy/Box";
import ListDivider from "@mui/joy/ListDivider";
import ListItem from "@mui/joy/ListItem";
import ListItemButton, { ListItemButtonProps } from "@mui/joy/ListItemButton";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { IUser } from "@typings/user";
import { sampleChat } from "../types";
import { toggleMessagesPane } from "../utils";
import AvatarWithStatus from "./AvatarWithStatusProps";
import { Badge } from "@mui/joy";
import { ChatModel } from "@typings/models";

type ChatListItemProps = ListItemButtonProps & {
  id: string;
  // unread?: boolean;
  sender: IUser;
  messages: ChatModel.Models.IChatMessage[];
  //selectedChatId?: string;
  setSelectedChat: (chat: ChatModel.Models.IChat) => void;
};

export default function ChatListItem({
  sender,
  messages,
  setSelectedChat,
  //selectedChatId
}: ChatListItemProps) {
  // const selected = selectedChatId === id;
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
            <AvatarWithStatus online={sender.online} src={sender.avatar} />
            <Box sx={{ flex: 1 }}>
              <Typography level="title-sm">{sender.nickname}</Typography>
              <Typography level="body-sm">{sender.nickname}</Typography>
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
            {messages[messages.length - 1].message}
          </Typography>
        </ListItemButton>
      </ListItem>
      <ListDivider sx={{ margin: 0 }} />
    </React.Fragment>
  );
}

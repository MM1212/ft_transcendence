import * as React from "react";
import Stack from "@mui/joy/Stack";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { Box, Chip, IconButton, Tooltip } from "@mui/joy";
import List from "@mui/joy/List";
import ChatListItem from "./ChatListItem";
import { useRecoilValue } from "recoil";
import chatsState from "@/apps/Chat/state";
import { useModalActions } from "@hooks/useModal";
import PlaylistEditIcon from "@components/icons/PlaylistEditIcon";
import ChatsInput from "./ChatsInput";
import { usePublicChatsModalActions } from "../modals/PublicChatsModal/hooks/usePublicChatsModal";
import ForumIcon from "@components/icons/ForumIcon";
import GenericPlaceholder from "@components/GenericPlaceholder";
import AccountGroupIcon from "@components/icons/AccountGroupIcon";

function ChatEntries() {
  const chatIds = useRecoilValue(chatsState.filteredChatIds);
  return (
    <>
      {chatIds.map((id, i) => (
        <ChatListItem key={id} id={id} last={i === chatIds.length - 1} />
      ))}
    </>
  );
}

export default function ChatsPane() {
  const { open } = useModalActions("chat:new-chat");
  const { open: openPublicChats } = usePublicChatsModalActions();
  const unreadPings = useRecoilValue(chatsState.unreadPings);
  const chatIds = useRecoilValue(chatsState.filteredChatIds);
  return (
    <Sheet
      sx={{
        height: "100%",
        overflowY: "auto",
        width: "35dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        p={2}
        pb={1.5}
      >
        <Typography
          fontSize={{ xs: "md", md: "lg" }}
          component="h1"
          fontWeight="lg"
          endDecorator={
            unreadPings > 0 && (
              <Chip
                variant="soft"
                color="primary"
                size="md"
                slotProps={{ root: { component: "span" } }}
              >
                {unreadPings > 9 ? "9+" : unreadPings}
              </Chip>
            )
          }
          sx={{ mr: "auto" }}
        >
          Messages
        </Typography>

        <Box gap={0.5} display="flex" alignItems="center">
          <Tooltip title="Public Chats" size="sm">
            <IconButton
              variant="plain"
              color="neutral"
              size="sm"
              onClick={openPublicChats}
            >
              <ForumIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="New Group Chat" size="sm">
            <IconButton
              variant="plain"
              color="neutral"
              size="sm"
              onClick={open}
            >
              <PlaylistEditIcon size="md" />
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>
      <Box sx={{ px: 2, pb: 1.5 }}>
        <ChatsInput />
      </Box>
      <Box flexGrow={1} overflow="auto" height="auto">
        <>
          {chatIds.length > 0 ? (
            <List
              sx={{
                py: 0,
                "--ListItem-paddingY": "0.75rem",
                "--ListItem-paddingX": "1rem",
              }}
            >
              <ChatEntries />
            </List>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: 'center',
                height: '100%'
              }}
            >
              <GenericPlaceholder
                title="No Available Messages"
                icon={<ForumIcon fontSize="xl4" />}
                // label="Start a New Conversation"
                path=""
              />
            </div>
          )}
        </>
      </Box>
    </Sheet>
  );
}

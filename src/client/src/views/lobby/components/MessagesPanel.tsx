/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MessagesPanel.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: mgranate_ls <mgranate_ls@student.42.fr>    +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/10/21 17:22:36 by mgranate_ls       #+#    #+#             */
/*   Updated: 2023/10/26 15:52:19 by mgranate_ls      ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { List } from "@mui/joy";
import { Input } from "@mui/joy";
import { Box, Chip, Sheet, Stack, Typography } from "@mui/joy";
import { ChatsPaneProps, sampleUsers } from "../types";
import ChatListItem from "./ChatListItems";

export default function MessagesPanel({
  chats,
  setSelectedChat,
}: ChatsPaneProps) {
  return (
    <Sheet
      sx={{
        borderRight: "1px solid",
        borderColor: "divider",
        height: "calc(100dvh - var(--Header-height))",
        overflowY: "auto",
        backgroundColor: "background.level1",
        width: "30%",
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
            <Chip
              variant="soft"
              color="primary"
              size="md"
              slotProps={{ root: { component: "span" } }}
            >
              10
            </Chip>
          }
          sx={{ mr: "auto" }}
        >
          Messages
        </Typography>
      </Stack>
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Input size="sm" placeholder="Search" aria-label="Search" />
      </Box>
      <List
        sx={{
          py: 0,
          "--ListItem-paddingY": "0.75rem",
          "--ListItem-paddingX": "1rem",
        }}
      >
        {chats.map((chat) => (
          <ChatListItem
            key={chat.id}
            id="31"
            sender={sampleUsers[0]}
            messages={chat.messages}
            setSelectedChat={setSelectedChat}
          />
        ))}
      </List>
    </Sheet>
  );
}

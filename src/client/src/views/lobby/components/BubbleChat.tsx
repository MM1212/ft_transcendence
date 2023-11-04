import * as React from "react";
import Box from "@mui/joy/Box";
import Stack from "@mui/joy/Stack";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { ChatModel } from "@typings/models";
import { IUser } from "@typings/user";

type ChatBubbleProps = {
  bubMessage: ChatModel.Models.IChatMessage;
  me: IUser;
};

export default function ChatBubble({ bubMessage, me }: ChatBubbleProps) {
  const [isLiked] = React.useState<boolean>(false);
  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const isMe = bubMessage.author.id === me.id;

  return (
    <Box sx={{ maxWidth: "60%", minWidth: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 0.25 }}
      >
        <Typography level="body-xs"></Typography>
        <Typography level="body-xs">
          {/* {formatTimestamp(bubMessage.timestamp)} */}
        </Typography>
      </Stack>
      {/* {attachment ? (
        <Sheet
          variant="outlined"
          sx={{
            px: 1.75,
            py: 1.25,
            borderRadius: "lg",
            borderTopRightRadius: isMe ? 0 : "lg",
            borderTopLeftRadius: isMe ? "lg" : 0,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar color="primary" size="lg"></Avatar>
            <div>
              <Typography fontSize="sm">{attachment.fileName}</Typography>
              <Typography level="body-sm">{attachment.size}</Typography>
            </div>
          </Stack>
        </Sheet>
      ) : ( */}
      <Box
        sx={{ position: "relative" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Sheet
          color={isMe ? "primary" : "neutral"}
          variant={isMe ? "solid" : "soft"}
          sx={{
            p: 1.25,
            borderRadius: "lg",
            borderTopRightRadius: isMe ? 0 : "lg",
            borderTopLeftRadius: isMe ? "lg" : 0,
            backgroundColor: isMe
              ? "var(--joy-palette-primary-solidBg)"
              : "background.body",
          }}
        >
          <Typography
            level="body-sm"
            sx={{
              color: isMe
                ? "var(--joy-palette-common-white)"
                : "var(--joy-palette-text-primary)",
            }}
          >
            {bubMessage.message}
          </Typography>
        </Sheet>
        {(isHovered || isLiked) && (
          <Stack
            direction="row"
            justifyContent={isMe ? "flex-end" : "flex-start"}
            spacing={0.5}
            sx={{
              position: "absolute",
              top: "50%",
              p: 1.5,
              ...(isMe
                ? {
                    left: 0,
                    transform: "translate(-100%, -50%)",
                  }
                : {
                    right: 0,
                    transform: "translate(100%, -50%)",
                  }),
            }}
          ></Stack>
        )}
      </Box>
    </Box>
  );
}

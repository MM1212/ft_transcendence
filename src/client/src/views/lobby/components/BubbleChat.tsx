import * as React from "react";
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import Stack from "@mui/joy/Stack";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import { MessageProps } from "../types";

type ChatBubbleProps = MessageProps & {
  variant: "sent" | "received";
};

export default function ChatBubble({
  content,
  variant,
  timestamp,
  attachment = undefined,
}: ChatBubbleProps) {
  const isSent = variant === "sent";
  const [isLiked, setIsLiked] = React.useState<boolean>(false);
  const [isHovered, setIsHovered] = React.useState<boolean>(false);

  return (
    <Box sx={{ maxWidth: "60%", minWidth: "auto" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 0.25 }}
      >
        <Typography level="body-xs"></Typography>
        <Typography level="body-xs">{timestamp}</Typography>
      </Stack>
      {attachment ? (
        <Sheet
          variant="outlined"
          sx={{
            px: 1.75,
            py: 1.25,
            borderRadius: "lg",
            borderTopRightRadius: isSent ? 0 : "lg",
            borderTopLeftRadius: isSent ? "lg" : 0,
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
      ) : (
        <Box
          sx={{ position: "relative" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Sheet
            color={isSent ? "primary" : "neutral"}
            variant={isSent ? "solid" : "soft"}
            sx={{
              p: 1.25,
              borderRadius: "lg",
              borderTopRightRadius: isSent ? 0 : "lg",
              borderTopLeftRadius: isSent ? "lg" : 0,
              backgroundColor: isSent
                ? "var(--joy-palette-primary-solidBg)"
                : "background.body",
            }}
          >
            <Typography
              level="body-sm"
              sx={{
                color: isSent
                  ? "var(--joy-palette-common-white)"
                  : "var(--joy-palette-text-primary)",
              }}
            >
              {content}
            </Typography>
          </Sheet>
          {(isHovered || isLiked) && (
            <Stack
              direction="row"
              justifyContent={isSent ? "flex-end" : "flex-start"}
              spacing={0.5}
              sx={{
                position: "absolute",
                top: "50%",
                p: 1.5,
                ...(isSent
                  ? {
                      left: 0,
                      transform: "translate(-100%, -50%)",
                    }
                  : {
                      right: 0,
                      transform: "translate(100%, -50%)",
                    }),
              }}
            >
            </Stack>
          )}
        </Box>
      )}
    </Box>
  );
}

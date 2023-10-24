import * as React from "react";
import Avatar from "@mui/joy/Avatar";
import Button from "@mui/joy/Button";
import Chip from "@mui/joy/Chip";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import { IUser } from "@typings/user";
import { Badge } from "@mui/joy";

type ChatHeader = {
  sender: IUser;
};

export default function MessagesPaneHeader({ sender }: ChatHeader) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.body",
      }}
      py={{ xs: 2, md: 2 }}
      px={{ xs: 1, md: 2 }}
    >
      <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center">
        <Avatar size="lg" src={sender.avatar} />

        <div>
          <Typography
            fontWeight="lg"
            fontSize="lg"
            component="h2"
            noWrap
            endDecorator={
              sender.online ? (
                <Chip
                  variant="outlined"
                  size="sm"
                  color="neutral"
                  sx={{
                    borderRadius: "sm",
                    paddingLeft: "0.9rem",
                  }}
                  slotProps={{ root: { component: "span" } }}
                  startDecorator={
                    <Badge
                      sx={{
                        position: "absolute",
                        width: "0.1rem",
                        height: "0.1rem",
                      }}
                      badgeInset="1px 7px"
                      color="success"
                      variant="soft"
                    />
                  }
                >
                  Online
                </Chip>
              ) : undefined
            }
          >
            {sender.nickname}
          </Typography>

          <Typography level="body-sm">{sender.nickname}</Typography>
        </div>
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center">
        <Button
          color="neutral"
          variant="outlined"
          size="sm"
          sx={{
            display: { xs: "none", md: "inline-flex" },
          }}
        >
          Call
        </Button>
        <Button
          color="neutral"
          variant="outlined"
          size="sm"
          sx={{
            display: { xs: "none", md: "inline-flex" },
          }}
        >
          View profile
        </Button>
        <IconButton size="sm" variant="plain" color="neutral"></IconButton>
      </Stack>
    </Stack>
  );
}

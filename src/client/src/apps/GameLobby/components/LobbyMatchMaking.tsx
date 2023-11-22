import AvatarWithStatus from "@components/AvatarWithStatus";
import { useCurrentUser, useSession } from "@hooks/user";
import { Card, CardContent, CardCover } from "@mui/joy";
import { Typography } from "@mui/joy";
import { Button } from "@mui/joy";
import { Avatar, Box, Sheet } from "@mui/joy";
import { Polygon } from "pixi.js";

export function LobbyMatchMaking() {
  const user = useCurrentUser();
  if (user === null) return;
  return (
    <Sheet
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "unset",
        alignItems: "center",
        img: {
          width: "24dvh",
          height: "45dvh",
        },
      }}
    >
      <Box>
        <Avatar
          sx={(theme) => ({
            width: theme.spacing(17),
            height: theme.spacing(17),
          })}
          src={user?.avatar}
        />
        <img src="/matchMaking/matchMakingFrame.png"></img>
      </Box>
    </Sheet>
  );
}

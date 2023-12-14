import { UserAvatar } from "@components/AvatarWithStatus";
import KarateIcon from "@components/icons/KarateIcon";
import { IconButton } from "@mui/joy";
import { Divider } from "@mui/joy";
import { Stack, Typography } from "@mui/joy";
import { useRecoilValue } from "recoil";
import pongGamesState from "../state";

export default function LobbyInvitedCustom() {

  const spectatorsList = useRecoilValue(pongGamesState.gameLobby);
  if (spectatorsList === null) return null;
  return (
    <>
      <Stack sx={{ width: "100" }}>
        {spectatorsList?.spectators.length > 0 ? (
          spectatorsList?.spectators.map((user, index) => (
            <>
              <Stack
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <UserAvatar src={user?.avatar} sx={{ width: 20, height: 20 }} />
                <Typography level="body-sm" sx={{ ml: 2 }}>
                  {user?.nickname}
                </Typography>
                <IconButton sx={{ ml: "auto" }}>
                  <KarateIcon />
                </IconButton>
              </Stack>
              <Divider sx={{ mb: 2 }} />
            </>
          ))
        ) : (
          <Typography level="body-sm">No spectators</Typography>
        )}
      </Stack>
    </>
  );
}

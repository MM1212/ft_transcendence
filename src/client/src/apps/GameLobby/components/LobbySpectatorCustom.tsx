import { UserAvatar } from "@components/AvatarWithStatus";
import KarateIcon from "@components/icons/KarateIcon";
import { useUser } from "@hooks/user";
import { IconButton } from "@mui/joy";
import { Divider } from "@mui/joy";
import { Stack, Typography } from "@mui/joy";
import UsersModel from "@typings/models/users";
import { useRecoilValue } from "recoil";
import pongGamesState from "../state";

export default function LobbyInvitedCustom() {
  const usersSample: (UsersModel.Models.IUserInfo | null)[] = [
    useUser(1) ?? null,
    useUser(2) ?? null,
    useUser(3) ?? null,
    useUser(4) ?? null,
    useUser(5) ?? null,
  ];
  const spectatorsList = useRecoilValue(pongGamesState.isInLobby);
  
  return (
    <>
      <Stack sx={{ width: "100" }}>
        {usersSample.length > 0 ? (
          usersSample.map((user, index) => (
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

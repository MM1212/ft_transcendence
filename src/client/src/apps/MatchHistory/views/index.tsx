import { useUser } from "@hooks/user";
import { Box, Divider, Sheet, Stack } from "@mui/joy";
import LobbyGameTypography from "@apps/GameLobby/components/LobbyGameTypography";
import UserMatchHistory from "@apps/Profile/components/UserMatchHistory";
import UsersModel from "@typings/models/users";

export default function MatchHistory() {
  const users = [
    useUser(1),
    useUser(2),
    useUser(3),
    useUser(4),
    useUser(5),
    useUser(6),
    useUser(7),
    useUser(9),
    useUser(10),
    useUser(11),
    useUser(12),
  ];
  const filteredUsers = users.filter((user) => user !== null) as UsersModel.Models.IUserInfo[];

  if (filteredUsers.length === 0) return null;
  if (users === null) return ;
  return (
    <Sheet
      sx={{
        width: "100dvh",
        p: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      <LobbyGameTypography level="body-lg">Match History</LobbyGameTypography>
      <Divider />
     <UserMatchHistory users={filteredUsers}/>
    </Sheet>
  );
}
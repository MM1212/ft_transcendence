import { useUser } from "@hooks/user";
import { Box, Divider, Sheet, Stack } from "@mui/joy";
import LeaderBoardUser from "../components/LeaderBoardUser";
import { randomInt } from "@utils/random";
import LobbyGameTypography from "@apps/GameLobby/components/LobbyGameTypography";
import { alpha } from "@theme";
import { fourth } from "../styles";

export default function LeaderBoard() {
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
      <LobbyGameTypography level="body-lg">Leaderboard</LobbyGameTypography>
      <Divider />
      <Sheet
        sx={{
          margin: 1.2,
          display: "grid",
          pl:1,
          gridTemplateColumns: "1fr 4.5fr 10.4fr 6fr",
          rowGap: 4,
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        <LobbyGameTypography
          style={{
            gridColumnStart: "1",
            justifySelf: "left",
          }}
          level="body-md"
        >
          Rank
        </LobbyGameTypography>
        <LobbyGameTypography
          style={{
            gridColumnStart: "3",
            justifySelf: "left",
          }}
          level="body-md"
        >
          Player
        </LobbyGameTypography>
        <LobbyGameTypography
          style={{
            gridColumnStart: "4",
            justifySelf: "left",
          }}
          level="body-md"
        >
          Points
        </LobbyGameTypography>
        <LobbyGameTypography style={fourth} level="body-md">
          Win Rate
        </LobbyGameTypography>
      </Sheet>
      <Box
        rowGap={2}
        width="100%"
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          overflowY: "auto",
          paddingRight: 10,
        }}
      >
        {users.map((user, i) => (
          <LeaderBoardUser
            key={i}
            position={i + 1}
            user={user!}
            points={randomInt(5, 50) * Math.pow(2, 10 - i)}
            winsLoses={`${randomInt(0, 100)}%` as any}
          />
        ))}
      </Box>
    </Sheet>
  );
}

import { useUser } from "@hooks/user";
import { Box, Divider, Sheet, Stack } from "@mui/joy";
import LeaderBoardUser from "../components/LeaderBoardUser";
import { randomInt } from "@utils/random";
import LobbyGameTypography from "@apps/GameLobby/components/LobbyGameTypography";
import { alpha } from "@theme";
import { fourth } from "../styles";
import GenericPlaceholder from "@components/GenericPlaceholder";
import TableTennisIcon from "@components/icons/TableTennisIcon";

export default function LeaderBoard() {
  const users = [useUser(1), useUser(2)];
  return (
    <Sheet
      sx={{
        width: "80dvh",
        p: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      <LobbyGameTypography level="body-lg">Leaderboard</LobbyGameTypography>
      <Divider />
      <>
        {users.length == 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <GenericPlaceholder
              title="No Available Games to Join"
              icon={<TableTennisIcon fontSize="xl4" />}
              label="Play a Match"
              path="/pong/play/queue"
            />
          </div>
        ) : (
          <>
            <Sheet
              sx={{
                width: "100%",
                margin: 1.2,
                display: "grid",
                gridTemplateColumns: "2.1fr 3fr 8fr 6.2fr 2.5fr",
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
              <LobbyGameTypography
                style={{
                  gridColumnStart: "5",
                }}
                level="body-md"
              >
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
          </>
        )}
      </>
    </Sheet>
  );
}

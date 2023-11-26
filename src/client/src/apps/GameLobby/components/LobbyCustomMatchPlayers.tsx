import { Box, Typography } from "@mui/joy";
import { Stack } from "@mui/joy";
import LobbyPlayerPlaceholder from "./LobbyPlayerPlacehoder";
import LobbyGameTypography from "./LobbyGameTypography";

export default function LobbbyCustomMatchPlayers({
  nbPlayers,
  playersId,
}: {
  playersId: number[];
  nbPlayers: number;
}) {
  console.log(playersId);
  return (
    <>
      <Stack
        sx={{
          flexDirection: "row",
          display: "flex",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
          }}
        >
          <LobbyGameTypography sx={{mb:2, border:'unset'}} level="title-lg">Team 1</LobbyGameTypography>
          {nbPlayers === 2 ? (
            <>
              <LobbyPlayerPlaceholder id={playersId[0]} position={1} />
            </>
          ) : (
            <>
              <LobbyPlayerPlaceholder id={playersId[0]} position={2} />
              <LobbyPlayerPlaceholder id={playersId[1]} position={2} />
            </>
          )}
        </Box>
        <Box sx={{ width: "20%" }}></Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "left",
            flexDirection: "column",
            width: "100%",
            height: "100%",
          }}
        >
          <LobbyGameTypography sx={{mb:2, border:'unset'}} level="title-lg">Team 2</LobbyGameTypography>
          {nbPlayers === 2 ? (
            <LobbyPlayerPlaceholder id={playersId[1]} position={1} />
          ) : (
            <>
              <LobbyPlayerPlaceholder id={playersId[2]} position={2} />
              <LobbyPlayerPlaceholder id={playersId[3]} position={2} />
            </>
          )}
        </Box>
      </Stack>
    </>
  );
}

import { Box } from "@mui/joy";
import { Stack } from "@mui/joy";
import LobbyPlayerPlaceholder from "./LobbyPlayerPlacehoder";

export default function LobbbyCustomMatchPlayers({
  nbPlayers,
}: {
  nbPlayers: number;
}) {
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
          {nbPlayers === 2 ? (
            <LobbyPlayerPlaceholder id={1} position={1} />
          ) : (
            <>
              <LobbyPlayerPlaceholder id={0} position={2} />
              <LobbyPlayerPlaceholder id={0} position={2} />
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
          {nbPlayers === 2 ? (
            <LobbyPlayerPlaceholder id={1} position={1} />
          ) : (
            <>
              <LobbyPlayerPlaceholder id={0} position={2} />
              <LobbyPlayerPlaceholder id={0} position={2} />
            </>
          )}
        </Box>
      </Stack>
    </>
  );
}

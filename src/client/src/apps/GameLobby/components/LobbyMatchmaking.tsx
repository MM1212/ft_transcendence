import { Stack } from "@mui/joy";
import { Box, Divider, Sheet } from "@mui/joy";
import LobbyPlayerPlaceholder from "./LobbyPlayerPlacehoder";

export default function LobbyMatchmaking({ key }: { key: number }) {
  console.log("LobbyMatchmaking");
  return (
    <Sheet
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "unset",
        flexDirection: "row",
      }}
    >
      <Box
        sx={{
          width: "50%",
          height: "100%",
        }}
      >
        <LobbyPlayerPlaceholder />
        <LobbyPlayerPlaceholder />
      </Box>
      {/* <Divider orientation="vertical" /> */}
      <Box
        sx={{
          width: "50%",
          height: "100%",
        }}
      ></Box>
      <Divider orientation="vertical" />
    </Sheet>
  );
}

import { Box, Stack, Typography } from "@mui/joy";
import LobbyPlayerPlaceholder from "./LobbyPlayerPlacehoder";
import LobbyGameTypography from "./LobbyGameTypography";
import ShurikenIcon from "@components/icons/ShurikenIcon";

export default function LobbyRoom(
  spectators: string,
  teamSize: string | null,
  name: string,
  password: string
) {
  console.log(spectators, teamSize, name, password);
  return (
    <>
      <div style={{marginBottom: 80, display: "flex", alignItems: "left", width: "100%", flexDirection:'column' }}>
        <Typography
          variant="outlined"
          color="warning"
          level="title-lg"
          sx={{
            mt: 2,
            dispaly: "flex",
            alignItems: "left",
            border: "unset",
          }}
        >
          DOJO PONG CUSTOM MATCH
        </Typography>
        <Stack sx={{display: "flex", flexDirection:'row' }}>
        <LobbyGameTypography label="Costumized Room" level='body-sm' />
        <ShurikenIcon size ='xs' sx={{ml: 1, mr: 1, mt: 0.7}} />
        <LobbyGameTypography label="4v4" level='body-sm' />
        </Stack>
      </div>
      <Stack
        sx={{
          flexDirection: "row",
          display: "flex",
          width: '100%'
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
          }}
        >
          <LobbyPlayerPlaceholder id={1} position={1} />
          <LobbyPlayerPlaceholder id={0} position={2} />
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
          <LobbyPlayerPlaceholder id={0} position={3} />
          <LobbyPlayerPlaceholder id={0} position={4} />
        </Box>
      </Stack>
    </>
  );
}

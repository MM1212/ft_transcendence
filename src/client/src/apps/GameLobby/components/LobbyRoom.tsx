import { Stack, Typography } from "@mui/joy";
import LobbyGameTypography from "./LobbyGameTypography";
import ShurikenIcon from "@components/icons/ShurikenIcon";
import LobbbyCustomMatchPlayers from "./LobbyCustomMatchPlayers";
import { alpha } from "@theme";
import LobbyPongTabs from "./LobbyPongTabs";
import LobbyInvitedCustom from "./LobbyInvitedCustom";
import LobbySpectatorCustom from "./LobbySpectatorCustom";

export default function LobbyRoom({
  spectators,
  teamSize,
  name,
  password,
}: {
  spectators: string;
  teamSize: string | null;
  name: string;
  password: string;
}) {
  console.log(spectators, teamSize, name, password);
  const customTabs = ["Invited", "Spectators"];
  const components = [
    <LobbyInvitedCustom key={0} />,
    <LobbySpectatorCustom key={1} />,
  ];

  return (
    <>
      <div
        style={{
          marginBottom: 80,
          display: "flex",
          alignItems: "left",
          width: "100%",
          flexDirection: "column",
        }}
      >
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
        <Stack sx={{ display: "flex", flexDirection: "row" }}>
          <LobbyGameTypography level="body-sm">
            {name}
          </LobbyGameTypography>
          <ShurikenIcon size="xs" sx={{ ml: 1, mr: 1, mt: 0.7 }} />
          {teamSize === "2" ? (
            <LobbyGameTypography level="body-sm">2v2</LobbyGameTypography>
          ) : (
            <LobbyGameTypography level="body-sm">4v4</LobbyGameTypography>
          )}
        </Stack>
        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            mt: 10,
          }}
        >
          <LobbbyCustomMatchPlayers nbPlayers={parseInt(teamSize!)!} />
        </Stack>
        <Stack
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            width: "100%",
            mt: 10,
          }}
        >
          <Stack
            overflow="auto"
            sx={{
              width: 300,
              height: 250,
              borderRadius: "md",
              backgroundColor: (theme) =>
                alpha(theme.resolveVar("palette-background-surface"), 0.5),
            }}
          >
            <LobbyPongTabs tabLabel={customTabs} reactComponents={components} />
          </Stack>
        </Stack>
      </div>
    </>
  );
}

import { Button, Stack, Typography } from "@mui/joy";
import LobbyGameTypography from "./LobbyGameTypography";
import ShurikenIcon from "@components/icons/ShurikenIcon";
import LobbbyCustomMatchPlayers from "./LobbyCustomMatchPlayers";
import { alpha } from "@theme";
import LobbyPongTabs from "./LobbyPongTabs";
import LobbyInvitedCustom from "./LobbyInvitedCustom";
import LobbySpectatorCustom from "./LobbySpectatorCustom";
import { roomPlayersTester } from "../state";
import { useRecoilState } from "recoil";
import { useCurrentUser } from "@hooks/user";
import React, { useEffect } from "react";
import AddFriendRoom from "./AddFriendRoom";
import { FindMatchWrapper } from "./LobbyMatchMaking";
import LobbyPongButton from "./LobbyPongBottom";

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
  const customTabs = ["Invited", "Spectators"];
  const components = [
    <LobbyInvitedCustom key={0} />,
    <LobbySpectatorCustom key={1} />,
  ];
  const [playersId, setPlayersId] = useRecoilState(roomPlayersTester);
  const user = useCurrentUser();
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (user && playersId.length === 0) {
      if (teamSize === "2")
        setPlayersId((prevPlayersId) => [...prevPlayersId, user.id]);
      else
        setPlayersId((prevPlayersId) => [...prevPlayersId, user.id]);
    }
  }, [user, playersId.length, setPlayersId]);

  const teamSizeInt = parseInt(teamSize!);
  const handleStartMatch = () => {
    console.log("start match");
  }
  if (user === null) return null;

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
        <Button
           onClick={() => setOpen(true)}
          sx={{ width: "25%", ml: "auto" }}
          type="submit"
          variant="outlined"
        >
          <Typography  >Invite</Typography>
        </Button>
        <AddFriendRoom open={open} setOpen={setOpen} roomSize={teamSizeInt} />
        <Stack sx={{ display: "flex", flexDirection: "row" }}>
          <LobbyGameTypography level="body-sm">{name}</LobbyGameTypography>
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
          <LobbbyCustomMatchPlayers
            playersId={playersId}
            nbPlayers={parseInt(teamSize!)!}
          />
        </Stack>
        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
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
                mb:10
            }}
          >
            <LobbyPongTabs tabLabel={customTabs} reactComponents={components} />
          </Stack>
          <FindMatchWrapper
            sx={{
              position: "relative",
            }}
            onClick={handleStartMatch}
          >
            <LobbyPongButton label="Start Match" src='/matchMaking/button1.webp'/>
          </FindMatchWrapper>
        </Stack>
      </div>
    </>
  );
}

import { useCurrentUser } from "@hooks/user";
import { styled } from "@mui/joy";
import { useState } from "react";
import MatchMakingCounter from "./MatchMakingCounter";
import LobbyPongButton from "./LobbyPongBottom";
import LobbyPlayerBanner from "./LobbyPlayerBanner";
import { ChangePower } from "./PlayerSettingsModals/ChangePower";

export const FindMatchWrapper = styled('div')(({ theme }) => ({
  '& > img': {
    transition: theme.transitions.create('filter', {
      duration: theme.transitions.duration.shortest,
    }),
    pointerEvents: 'none',
  },
  '& > span': {
    pointerEvents: 'none',
  },
  '&:hover': {
    cursor: 'pointer',
    '& > img': {
      filter: 'brightness(1.15)',
    },
  },
}));
export function LobbyMatchMaking() {
  const [isMatchmakingStarted, setIsMatchmakingStarted] = useState(false);
  const user = useCurrentUser();

  const handleStartMatchmaking = () => {
    if (!isMatchmakingStarted) setIsMatchmakingStarted(true);
    else setIsMatchmakingStarted(false);
  };

  if (user === null) return;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          width: '100%',
          justifyContent: "space-evenly",
        }}
      >
      <LobbyPlayerBanner id={user.id} />
      <LobbyPlayerBanner id={undefined}  />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '10dvh',
        }}
      >
        {isMatchmakingStarted && (
          <MatchMakingCounter stop={handleStartMatchmaking} />
        )}
        {!isMatchmakingStarted && (
          <FindMatchWrapper
            sx={{
              position: 'relative',
            }}
            onClick={handleStartMatchmaking}
          >
            <LobbyPongButton
              label="Find Match"
            />
          </FindMatchWrapper>
        )}
      </div>
    </div>
  );
}

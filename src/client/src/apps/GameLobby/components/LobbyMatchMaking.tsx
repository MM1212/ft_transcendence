import { useCurrentUser } from '@hooks/user';
import { styled } from '@mui/joy';
import { useState } from 'react';
import MatchMakingCounter from './MatchMakingCounter';
import LobbyPongButton from './LobbyPongBottom';
import LobbyPlayerBanner from './LobbyPlayerBanner';
import tunnel from '@lib/tunnel';
import PongModel from '@typings/models/pong';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import { OpenGameModal } from '@apps/GamePong/PongModal';
import notifications from '@lib/notifications/hooks';

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
  const isPlaying = useRecoilValue(pongGamesState.isPlaying);
  const lobby = useRecoilValue(pongGamesState.gameLobby);
  const user = useCurrentUser();

  const handleStartMatchmaking = useRecoilCallback(
    (ctx) => async () => {
      if (!isMatchmakingStarted) setIsMatchmakingStarted(true);
      else setIsMatchmakingStarted(false);
      try {
        let lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
        if (!lobby) {
          lobby = await tunnel.put(PongModel.Endpoints.Targets.NewLobby, {
            password: null,
            name: user!.nickname,
            spectators: PongModel.Models.LobbySpectatorVisibility.All,
            lobbyType: PongModel.Models.LobbyType.Single,
            gameType: PongModel.Models.LobbyGameType.Powers,
            lobbyAccess: PongModel.Models.LobbyAccess.Private,
            score: 7,
          });
          ctx.set(pongGamesState.gameLobby, lobby);
          await tunnel.put(PongModel.Endpoints.Targets.AddToQueue, {
            lobbyId: lobby.id,
          });
          notifications.success('Queue started');
        }
      } catch (error: unknown) {
        notifications.error('Failed to enter queue', (error as Error).message);
      }
    },
    [isMatchmakingStarted, user]
  );

  const handleStopMatchmaking = useRecoilCallback(
    (ctx) => async () => {
      setIsMatchmakingStarted(false);
      try {
        const lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
        if (!lobby) return;
        await tunnel.put(PongModel.Endpoints.Targets.LeaveQueue, {
          lobbyId: lobby.id,
        });
        ctx.set(pongGamesState.gameLobby, null);
        notifications.success('Queue stopped');
      } catch (error: unknown) {
        notifications.error('Failed to leave queue', (error as Error).message);
      }
    },
    []
  );

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
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          width: '100%',
          justifyContent: 'space-evenly',
        }}
      >
        <LobbyPlayerBanner id={user.id} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '10dvh',
        }}
      >
        {lobby ? (
          <MatchMakingCounter
            stop={handleStopMatchmaking}
            startedAt={lobby.createdAt}
          />
        ) : (
          <FindMatchWrapper
            sx={{
              position: 'relative',
            }}
            onClick={handleStartMatchmaking}
          >
            <LobbyPongButton label="Find Match" />
          </FindMatchWrapper>
        )}
        <OpenGameModal isPlaying={isPlaying} />
      </div>
    </div>
  );
}

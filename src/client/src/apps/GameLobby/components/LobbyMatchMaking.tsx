import { useCurrentUser } from '@hooks/user';
import { Box, styled } from '@mui/joy';
import React from 'react';
import MatchMakingCounter from './MatchMakingCounter';
import LobbyPongButton from './LobbyPongBottom';
import { LobbySelfBanner } from './LobbyPlayerBanner';
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
  const isPlaying = useRecoilValue(pongGamesState.isPlaying);
  const lobby = useRecoilValue(pongGamesState.gameLobby);
  const user = useCurrentUser();

  const [currentPower, setCurrentPower] = React.useState<string | null>();
  const [currentPaddle, setCurrentPaddle] = React.useState<string | null>();
  const [loading, setLoading] = React.useState(false);

  const handleStartMatchmaking = useRecoilCallback(
    (ctx) => async () => {
      if (!currentPower || !currentPaddle) {
        notifications.error(
          'Cannot start queue, no paddle or special power selected'
        );
        return;
      }
      try {
        setLoading(true);
        const cLobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
        if (cLobby) throw new Error('Already in a lobby');
        const { id } = await tunnel.put(PongModel.Endpoints.Targets.NewLobby, {
          password: null,
          name: user!.nickname,
          spectators: PongModel.Models.LobbySpectatorVisibility.All,
          lobbyType: PongModel.Models.LobbyType.Single,
          gameType: PongModel.Models.LobbyGameType.Powers,
          lobbyAccess: PongModel.Models.LobbyAccess.Private,
          score: 7,
        });
        const lobby = await tunnel.post(
          PongModel.Endpoints.Targets.UpdatePersonal,
          {
            lobbyId: id,
            paddleSkin: currentPaddle,
            specialPower: currentPower,
          }
        );
        ctx.set(pongGamesState.gameLobby, lobby);
        // update paddle and power here
        await tunnel.put(PongModel.Endpoints.Targets.AddToQueue, {
          lobbyId: id,
        });
        notifications.success('Queue started');
      } catch (error: unknown) {
        notifications.error('Failed to enter queue', (error as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [currentPaddle, currentPower, user]
  );

  const handleStopMatchmaking = useRecoilCallback(
    (ctx) => async () => {
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
        justifyContent: 'space-around',
        height: '100%',
      }}
    >
      <LobbySelfBanner
        showSelector
        disabled={!!lobby}
        onPaddleChange={setCurrentPaddle}
        onSpecialPowerChange={setCurrentPower}
      />
      <Box height="10dvh" display="flex" alignItems="center">
        {lobby ? (
          <MatchMakingCounter
            stop={handleStopMatchmaking}
            startedAt={lobby.createdAt}
          />
        ) : (
          <LobbyPongButton
            label="Find Match"
            loading={loading}
            onClick={handleStartMatchmaking}
          />
        )}
      </Box>
      <OpenGameModal isPlaying={isPlaying} />
    </div>
  );
}

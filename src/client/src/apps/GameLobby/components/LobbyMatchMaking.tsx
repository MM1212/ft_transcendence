import { useCurrentUser } from '@hooks/user';
import { styled } from '@mui/joy';
import { useState } from 'react';
import MatchMakingCounter from './MatchMakingCounter';
import LobbyPongButton from './LobbyPongBottom';
import LobbyPlayerBanner from './LobbyPlayerBanner';
import { ChangePower } from './PlayerSettingsModals/ChangePower';
import tunnel from '@lib/tunnel';
import PongModel from '@typings/models/pong';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import { OpenGameModal } from '@apps/GamePong/PongModal';

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
  const user = useCurrentUser();

  const handleStartMatchmaking = useRecoilCallback(
    (ctx) => async () => {
      try {
        let lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
        if (!isMatchmakingStarted) {
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
            setIsMatchmakingStarted(true);
            await tunnel.put(PongModel.Endpoints.Targets.AddToQueue, {
              lobbyId: lobby.id,
            });
          }
        } else {
          setIsMatchmakingStarted(false);
          if (lobby) {
            await tunnel.put(PongModel.Endpoints.Targets.LeaveQueue, {
              lobbyId: lobby.id,
            });
            ctx.set(pongGamesState.gameLobby, null);
          }
        }
        /*
        alreaDY HAS LOBBY
        else {
          await tunnel.put(PongModel.Endpoints.Targets.AddToQueue, {
            lobbyId: lobby.id,
          });
        }
        */
      } catch {
        console.log('error in: create lobby and add to queue or leave lobby');
      }

      // else {
      //   tunnel.put(PongModel.Endpoints.Targets.LeaveLobby, {
      //     lobbyId: lobby.id,
      //   });
      //   console.log('leaveLobby');
      // }
    },
    [isMatchmakingStarted, user]
  );

  if (user === null) return;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%',
          width: '100%',
          justifyContent: 'space-around',
        }}
      >
        <LobbyPlayerBanner id={user.id} />
        <LobbyPlayerBanner id={undefined} />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '10dvh',
        }}
      >
        <ChangePower />

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
              src="/matchMaking/button1.webp"
            />
          </FindMatchWrapper>
        )}
        <OpenGameModal isPlaying={isPlaying} />
      </div>
    </div>
  );
}

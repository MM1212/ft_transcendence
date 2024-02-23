import pongGamesState from '@apps/GameLobby/state';
import { ModalClose, Typography } from '@mui/joy';
import { Modal, ModalDialog } from '@mui/joy';
import PongModel from '@typings/models/pong';
import React from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { useListenerManager } from './events/ListenerManager';
import { useCurrentUser } from '@hooks/user';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { useSocket } from '@hooks/socket';
import { navigate } from 'wouter/use-location';

export function OpenGameModal({
  isPlaying,
  isPlayer,
}: {
  isPlaying: boolean;
  isPlayer: boolean;
}) {
  const lobby = useRecoilValue(pongGamesState.gameLobby);

  const userId = useCurrentUser()!.id;

  const {
    emit,
  } = useSocket(buildTunnelEndpoint(PongModel.Endpoints.Targets.Connect));

  const handleSpectatorLeave = useRecoilCallback(
    (ctx) =>  () => {
      try {
        if (lobby === null) return;
        if (!userId) return;
         emit(PongModel.Socket.Events.SpectatorLeave, {
          lobbyId: lobby.id,
          userId: userId,
        });
        navigate('/');
        ctx.set(pongGamesState.gameLobby, null);
      } catch (error) {
        console.error(error);
      }
    },
    [emit, lobby, userId]
  );

  console.log(lobby?.id);
  if (lobby === null) return;
  return (
    <>
      <Modal
        open={isPlaying}
        onClose={isPlayer === false ? handleSpectatorLeave : close}
      >
        <ModalDialog
          layout="fullscreen"
          sx={{
            bgcolor: 'divider',
            backdropFilter: 'blur(5px)',
          }}
        >
          {isPlayer === false && <ModalClose />}
          <PongComponent lobby={lobby} />
        </ModalDialog>
      </Modal>
    </>
  );
}

//import Pong from '@views/pong';
function PongComponent({ lobby }: { lobby: PongModel.Models.ILobby }) {
  const { parentRef, alreadyConnected } = useListenerManager();

  const mountRef = React.useMemo(() => <div ref={parentRef} />, [parentRef]);

  return alreadyConnected ? (
    <Typography>
      You are already connected, either close the other browser or play on it!
    </Typography>
  ) : (
    <>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {mountRef}
      </div>
    </>
  );
}

import ChatBox from '@apps/Lobby_Old/components/InGameChat';
import React, { useSyncExternalStore } from 'react';
import { ClientLobby } from '../src/Lobby';
import { Snapshot, useRecoilTransactionObserver_UNSTABLE } from 'recoil';
import { useSocket } from '@hooks/socket';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { CircularProgress, Modal } from '@mui/joy';
import LobbyModel from '@typings/models/lobby';

export default function LobbyView(): JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);
  const lobbyRef = React.useRef<ClientLobby | null>(null);
  const currentSnapshot = React.useRef<Snapshot | null>(null);
  const {
    socket,
    connected,
    useListener,
    useListenerWithAck
  } = useSocket(buildTunnelEndpoint('/lobby'));

  useListenerWithAck(
    'lobby:init',
    (data: LobbyModel.Models.ILobby) => {
      console.log('lobby:init', data);
      lobbyRef.current?.__sockLobbyInit(data);
      console.log('lobby:init done');
    },
    []
  );

  useListenerWithAck(
    'player:join',
    (data: LobbyModel.Models.IPlayer) =>
      lobbyRef.current?.__sockPlayerJoin(data),
    []
  );

  useListenerWithAck(
    'player:leave',
    (data: { id: number }) => lobbyRef.current?.__sockPlayerLeave(data.id),
    []
  );

  useListener(
    'player:animation',
    (data: {
      id: number;
      animation: LobbyModel.Models.IPenguinBaseAnimationsTypes;
    }) =>
      lobbyRef.current?.network.netOnPlayerAnimation(data.id, data.animation),
    []
  );

  useListener(
    'player:move',
    (data: { id: number; transform: Partial<LobbyModel.Models.ITransform> }) =>
      lobbyRef.current?.network.netOnPlayerMove(data.id, data.transform),
    []
  );

  const isLobbyLoading = useSyncExternalStore<boolean>(
    (cb) => {
      if (!lobbyRef.current) return () => void 0;
      lobbyRef.current.events.on('rerender', cb);
      return () => {
        lobbyRef.current?.events.off('rerender', cb);
      };
    },
    () => !!lobbyRef.current?.loading
  );
  React.useEffect(() => {
    if (!ref.current) return;
    lobbyRef.current = new ClientLobby(
      ref.current,
      socket,
      currentSnapshot.current
    );
    lobbyRef.current.onMount().then(() => socket.connect());
    return () => {
      lobbyRef.current?.destructor();
      lobbyRef.current = null;
      socket.disconnect();
    };
  }, [socket]);

  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    currentSnapshot.current = snapshot;
    if (!lobbyRef.current) return;
    lobbyRef.current.snapshot = snapshot;
  });

  const targetElem = React.useMemo(
    () => (
      <div
        style={{
          height: '100dvh',
          width: '100dvw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        ref={ref}
      />
    ),
    []
  );
  console.log('rendering lobby view', connected, lobbyRef.current?.loading);

  return React.useMemo(
    () => (
      <div>
        {targetElem}
        <ChatBox />
        <Modal
          open={!connected || isLobbyLoading}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          disableAutoFocus
          disableEnforceFocus
        >
          <CircularProgress
            variant="plain"
            style={{
              pointerEvents: 'none',
            }}
          />
        </Modal>
      </div>
    ),
    [connected, targetElem, isLobbyLoading]
  );
}

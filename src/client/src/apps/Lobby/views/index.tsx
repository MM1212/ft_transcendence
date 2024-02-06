import ChatBox from '@apps/Lobby/components/InGameChat';
import React from 'react';
import { ClientLobby } from '../src/Lobby';
import {
  Snapshot,
  useRecoilCallback,
  useRecoilTransactionObserver_UNSTABLE,
} from 'recoil';
import { useSocket } from '@hooks/socket';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { CircularProgress, Modal } from '@mui/joy';
import LobbyModel from '@typings/models/lobby';
import lobbyState, { lobbyAtom } from '../state';
import { useIsLobbyLoading } from '../hooks';
import LobbyInteractionsPanel from '../components/InterationsPanel';
import type { InteractionData } from '../src/Interaction';
import { useKeybindsToggle } from '@hooks/keybinds';

export default function LobbyView(): JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);
  const lobbyRef = React.useRef<ClientLobby | null>(null);
  const currentSnapshot = React.useRef<Snapshot | null>(null);
  const { socket, connected, useListener, useListenerWithAck } = useSocket(
    buildTunnelEndpoint('/lobby')
  );

  useListenerWithAck(
    'lobby:init',
    (data: LobbyModel.Models.ILobby) => lobbyRef.current?.__sockLobbyInit(data),
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

  useListener(
    'player:clothes',
    (data: {
      id: number;
      changed: Record<LobbyModel.Models.InventoryCategory, number>;
    }) => lobbyRef.current?.network.netOnPlayerClothes(data.id, data.changed),
    []
  );

  const isLobbyLoading = useIsLobbyLoading();

  const syncLobbyInteractions = useRecoilCallback(
    (ctx) => (interactions: InteractionData[]) => {
      ctx.set(lobbyState.showingInteractions, interactions);
    },
    []
  );

  const onInteractionClickHandler = useRecoilCallback(
    (ctx) => async (key: string, pressed: boolean) => {
      if (!lobbyRef.current) return;
      await lobbyRef.current.interactions.__handleKeydown(key, pressed, ctx);
    },
    []
  );

  useKeybindsToggle(undefined, onInteractionClickHandler, []);

  const initLobby = useRecoilCallback(
    (ctx) => () => {
      if (!ref.current) return;
      lobbyRef.current = new ClientLobby(
        ref.current,
        socket,
        currentSnapshot.current
      );
      lobbyRef.current.interactions.__sync = syncLobbyInteractions;
      lobbyRef.current.onMount().then(() => socket.connect());
      ctx.set(lobbyAtom, lobbyRef.current);
    },
    [socket, syncLobbyInteractions]
  );

  React.useEffect(() => {
    initLobby();
    return () => {
      lobbyRef.current?.destructor();
      lobbyRef.current = null;
      socket.disconnect();
    };
  }, [socket, initLobby]);

  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    currentSnapshot.current = snapshot;
    if (!lobbyRef.current) return;
    lobbyRef.current.__handleNewSnapshot(snapshot);
  });

  React.useEffect(() => {
    if (!lobbyRef.current) return;
    if (connected) return;
    lobbyRef.current.loading = true;
  }, [connected]);

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

  return React.useMemo(
    () => (
      <div>
        {targetElem}
        <React.Suspense fallback={null}>
          <ChatBox />
          <LobbyInteractionsPanel />
        </React.Suspense>
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

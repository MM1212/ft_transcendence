import { Button, ButtonGroup, Stack, Typography } from '@mui/joy';
import LobbyGameTypography from './LobbyGameTypography';
import ShurikenIcon from '@components/icons/ShurikenIcon';
import LobbbyCustomMatchPlayers from './LobbyCustomMatchPlayers';
import { alpha } from '@theme';
import LobbyPongTabs from './LobbyPongTabs';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { useCurrentUser, useUser } from '@hooks/user';
import React, { useEffect, useState } from 'react';
// import AddFriendRoom from "./AddFriendRoom";
import { FindMatchWrapper } from './LobbyMatchMaking';
import LobbyPongButton from './LobbyPongBottom';
import pongGamesState from '../state';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import PongModel from '@typings/models/pong';
import LobbyInviteSpectate from './LobbyInviteSpectate';
import LogoutIcon from '@components/icons/LogoutIcon';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import { LobbySettings } from './LobbySettings';

export default function LobbyRoom() {
  const customTabs = ['Chat', 'Invited', 'Spectators', 'Settings'];
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;
  const components = [
    <LobbyInviteSpectate key={0} type="No pending Messages" usersId={[]} />,
    <LobbyInviteSpectate key={1} type="No pending invites" usersId={[]} />,
    <LobbyInviteSpectate
      key={2}
      type="No Spectators"
      usersId={lobby.spectators.map((user) => user.id)}
    />,
    <LobbySettings key={3}/>
  ];
  const [leftTeam, rightTeam] = lobby.teams;

  const user = useCurrentUser();

  const player = leftTeam.players
    .concat(rightTeam.players)
    .concat(lobby.spectators)
    .find((player) => player.id === user?.id);

  const handleStartMatch = useRecoilCallback((ctx) => async () => {
    console.log('start match');
  });

  const handleReady = useRecoilCallback((ctx) => async () => {
    try {
      await tunnel.post(PongModel.Endpoints.Targets.Ready, {
        lobbyId: lobby.id,
      });
    } catch (error) {
      console.log('Failed to ready up');
    }
  });

  const handleLeaveLobby = useRecoilCallback((ctx) => async () => {
    const notif = notifications.default('Leaving lobby...');
    try {
      const payload = {
        lobbyId: lobby.id,
      };
      await tunnel.put(PongModel.Endpoints.Targets.LeaveLobby, payload);
      notif.update({
        message: 'Left lobby successfully!',
        color: 'success',
      });

      ctx.set(pongGamesState.gameLobby, null);
      console.log(pongGamesState.gameLobby);
    } catch (error) {
      notifications.error('Failed to leave lobby', (error as Error).message);
    }
  });

  const handleJoinSpectators = useRecoilCallback((ctx) => async () => {
    try {
      await tunnel.post(PongModel.Endpoints.Targets.JoinSpectators, {
        lobbyId: lobby.id,
      });
    } catch {
      console.log('Failed to join spectators');
    }
  });

  if (user === null) return null;
  if (player === undefined) return null;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'left',
        width: '100%',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Typography
        variant="outlined"
        color="warning"
        level="title-lg"
        sx={{
          mt: 2,
          dispaly: 'flex',
          alignItems: 'left',
          border: 'unset',
        }}
      >
        DOJO PONG CUSTOM MATCH
      </Typography>
      <ButtonGroup sx={{ ml: 'auto' }} variant="plain">
        <Button
          onClick={handleJoinSpectators}
          type="submit"
          size="lg"
          color="warning"
          startDecorator={<LogoutIcon />}
          sx={{ justifyContent: 'flex-end' }}
        >
          Join Spectators
        </Button>
        <Button
          onClick={handleLeaveLobby}
          type="submit"
          size="lg"
          color="warning"
          startDecorator={<LogoutIcon />}
          sx={{ justifyContent: 'flex-end' }}
        >
          Leave
        </Button>
        <Button
          type="submit"
          size="lg"
          color="warning"
          startDecorator={<AccountPlusIcon />}
          sx={{ justifyContent: 'flex-end' }}
        >
          Invite
        </Button>
      </ButtonGroup>
      {/* <AddFriendRoom open={open} setOpen={setOpen} roomSize={teamSizeInt} /> */}
      <Stack sx={{ display: 'flex', flexDirection: 'row' }}>
        <LobbyGameTypography level="body-sm">{lobby.name}</LobbyGameTypography>
        <ShurikenIcon size="xs" sx={{ ml: 1, mr: 1, mt: 0.7 }} />
        {
          <LobbyGameTypography level="body-sm">
            {leftTeam.players.length}v{rightTeam.players.length}
          </LobbyGameTypography>
        }
      </Stack>
      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          mt: 10,
          flexGrow: 1,
        }}
      >
        <LobbbyCustomMatchPlayers leftTeam={leftTeam} rightTeam={rightTeam} />
      </Stack>
      <Stack
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          mt: 10,
        }}
      >
        <Stack
          overflow="auto"
          sx={{
            borderRadius: 'md',
            backgroundColor: (theme) =>
              alpha(theme.resolveVar('palette-background-surface'), 0.5),
            mb: 10,
          }}
        >
          <LobbyPongTabs tabLabel={customTabs} reactComponents={components} />
        </Stack>
        {user?.id === lobby.ownerId ? (
          <FindMatchWrapper
            sx={{
              position: 'relative',
              mt: 'auto !important',
            }}
            onClick={handleStartMatch}
          >
            <LobbyPongButton
              label="Start Match"
              src="/matchMaking/button1.webp"
            />
          </FindMatchWrapper>
        ) : (
          <FindMatchWrapper
            sx={{
              position: 'relative',
              mt: 'auto !important',
            }}
            onClick={handleReady}
          >
            <LobbyPongButton
              label={
                player.status === PongModel.Models.LobbyStatus.Ready
                  ? 'Ready'
                  : 'Not Ready'
              }
              src="/matchMaking/button1.webp"
            />
          </FindMatchWrapper>
        )}
      </Stack>
    </div>
  );
}

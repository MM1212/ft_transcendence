import { Box, Button, ButtonGroup, Stack, Typography } from '@mui/joy';
import LobbyGameTypography from './LobbyGameTypography';
import ShurikenIcon from '@components/icons/ShurikenIcon';
import LobbbyCustomMatchPlayers from './LobbyCustomMatchPlayers';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { useCurrentUser } from '@hooks/user';
import React from 'react';
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
import LobbyPongCustomMatchTabs from './LobbyPongCustomMatchTabs';
import EyeArrowRightIcon from '@components/icons/EyeArrowRightIcon';

export default function LobbyRoom() {
  const customTabs = ['Chat', 'Invited', 'Spectators'];
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;
  const components = [
    <LobbyInviteSpectate key={0} type="No pending Messages" usersId={[]} />,
    <LobbyInviteSpectate key={1} type="No pending invites" usersId={[]} />,
    <LobbyInviteSpectate
      key={2}
      type="No Spectators"
      usersId={lobby.spectators.map((user) => user.id)}
    />,
  ];
  const [leftTeam, rightTeam] = lobby.teams;

  const user = useCurrentUser();
  const [open, setOpen] = React.useState(false);

  const handleStartMatch = () => {
    console.log('start match');
  };
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
  return (
    <Box
      display="flex"
      justifyContent="space-evenly"
      alignItems="flex-start"
      width="100%"
      height="100%"
      flexDirection="column"
      gap={2}
    >
      <Typography
        variant="outlined"
        color="warning"
        level="title-lg"
        sx={{
          dispaly: 'flex',
          alignItems: 'left',
          border: 'unset',
        }}
      >
        DOJO PONG CUSTOM MATCH
      </Typography>
      <Stack sx={{ ml: 'auto' }} direction="row" spacing={1}>
        <Button
          onClick={handleJoinSpectators}
          type="submit"
          color="warning"
          variant="plain"
          startDecorator={<EyeArrowRightIcon />}
          sx={{ justifyContent: 'flex-end' }}
        >
          Spectate
        </Button>
        <Button
          onClick={() => setOpen(true)}
          type="submit"
          color="warning"
          variant="plain"
          startDecorator={<AccountPlusIcon />}
          sx={{ justifyContent: 'flex-end' }}
        >
          Invite
        </Button>
        <Button
          onClick={handleLeaveLobby}
          type="submit"
          color="warning"
          variant="plain"
          startDecorator={<LogoutIcon />}
          sx={{ justifyContent: 'flex-end' }}
        >
          Leave
        </Button>
      </Stack>
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
      <LobbbyCustomMatchPlayers leftTeam={leftTeam} rightTeam={rightTeam} />
      <Box display="flex" width="100%" flexGrow={1} mt={2} gap={8}>
        <LobbyPongCustomMatchTabs />
        <Box flex={1}>Settings</Box>
      </Box>
      <FindMatchWrapper
        sx={{
          position: 'relative',
          mt: 'auto !important',
          alignSelf: 'center',
        }}
        onClick={handleStartMatch}
      >
        <LobbyPongButton label="Start Match" src="/matchMaking/button1.webp" />
      </FindMatchWrapper>
    </Box>
  );
}

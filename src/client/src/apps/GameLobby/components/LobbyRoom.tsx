import { Button, Stack, Typography } from '@mui/joy';
import LobbyGameTypography from './LobbyGameTypography';
import ShurikenIcon from '@components/icons/ShurikenIcon';
import LobbbyCustomMatchPlayers from './LobbyCustomMatchPlayers';
import { alpha } from '@theme';
import LobbyPongTabs from './LobbyPongTabs';
import LobbyInvitedCustom from './LobbyInvitedCustom';
import LobbySpectatorCustom from './LobbySpectatorCustom';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';
import { useCurrentUser } from '@hooks/user';
import React, { useEffect } from 'react';
// import AddFriendRoom from "./AddFriendRoom";
import { FindMatchWrapper } from './LobbyMatchMaking';
import LobbyPongButton from './LobbyPongBottom';
import pongGamesState from '../state';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import PongModel from '@typings/models/pong';

export default function LobbyRoom() {
  const customTabs = ['Invited', 'Spectators'];
  const components = [
    <LobbyInvitedCustom key={0} />,
    <LobbySpectatorCustom key={1} />,
  ];
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;
  const [leftTeam, rightTeam] = lobby.teams;

  const user = useCurrentUser();
  const [open, setOpen] = React.useState(false);

  const teamSizeInt = parseInt('4');
  const handleStartMatch = () => {
    console.log('start match');
  };
  const handleLeaveLobby = useRecoilCallback((ctx) => async () => {
    const notif = notifications.default('Leaving lobby...');
    try {
      const payload = {
        lobbyId: lobby.id,
      };
      await tunnel.put(
        PongModel.Endpoints.Targets.LeaveLobby,
        payload,
      );
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
  
  
  if (user === null) return null;
  return (
    <>
      <div
        style={{
          marginBottom: 80,
          display: 'flex',
          alignItems: 'left',
          width: '100%',
          flexDirection: 'column',
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
        <Button
          onClick={handleLeaveLobby}
          sx={{ width: '25%', ml: 'auto' }}
          type="submit"
          variant="outlined"
        >
          <Typography>Leave Lobby</Typography>
        </Button>
        <Button
          onClick={() => setOpen(true)}
          sx={{ width: '25%', ml: 'auto' }}
          type="submit"
          variant="outlined"
        >
          <Typography>Invite</Typography>
        </Button>
        {/* <AddFriendRoom open={open} setOpen={setOpen} roomSize={teamSizeInt} /> */}
        <Stack sx={{ display: 'flex', flexDirection: 'row' }}>
          <LobbyGameTypography level="body-sm">
            {' '}
            NOME DA SALA
          </LobbyGameTypography>
          <ShurikenIcon size="xs" sx={{ ml: 1, mr: 1, mt: 0.7 }} />
          {<LobbyGameTypography level="body-sm">4v4</LobbyGameTypography>}
        </Stack>
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            mt: 10,
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
              width: 300,
              height: 250,
              borderRadius: 'md',
              backgroundColor: (theme) =>
                alpha(theme.resolveVar('palette-background-surface'), 0.5),
              mb: 10,
            }}
          >
            <LobbyPongTabs tabLabel={customTabs} reactComponents={components} />
          </Stack>
          <FindMatchWrapper
            sx={{
              position: 'relative',
            }}
            onClick={handleStartMatch}
          >
            <LobbyPongButton
              label="Start Match"
              src="/matchMaking/button1.webp"
            />
          </FindMatchWrapper>
        </Stack>
      </div>
    </>
  );
}

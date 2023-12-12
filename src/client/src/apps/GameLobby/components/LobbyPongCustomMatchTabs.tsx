import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { alpha } from '@theme';
import GameLobbyChat from './LobbyTabs/Chat';
import { useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import { LobbyInvitedList, LobbySpectatorsList } from './LobbyInviteSpectate';

export default function LobbyPongCustomMatchTabs(): JSX.Element {
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;
  return (
    <Tabs
      sx={{
        flex: 1,
        borderRadius: 'sm',
        overflow: 'hidden',
        bgcolor: (theme) =>
          alpha(theme.resolveVar('palette-background-surface'), 0.75),
      }}
      variant="plain"
    >
      <TabList style={{ borderRadius: 0 }} tabFlex={1}>
        <Tab color="warning">Chat</Tab>
        <Tab color="warning">Invited</Tab>
        <Tab color="warning">Spectators</Tab>
      </TabList>
      <TabPanel value={0}>
        <GameLobbyChat />
      </TabPanel>
      <TabPanel value={1}>
        <LobbyInvitedList type="No Pending Invites" usersId={lobby.invited} />
      </TabPanel>
      <TabPanel value={2}>
        <LobbySpectatorsList
          type="No Spectators"
          usersId={lobby.spectators.map((s) => s.id)}
        />
      </TabPanel>
    </Tabs>
  );
}

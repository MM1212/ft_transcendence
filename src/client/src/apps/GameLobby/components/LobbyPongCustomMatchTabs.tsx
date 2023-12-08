import { Tab, TabList, TabPanel, Tabs } from '@mui/joy';
import { alpha } from '@theme';
import GameLobbyChat from './LobbyTabs/Chat';

export default function LobbyPongCustomMatchTabs(): JSX.Element {
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
      <TabList style={{ borderRadius: 0 }} tabFlex={1} >
        <Tab color="warning">Chat</Tab>
        <Tab color="warning">Invited</Tab>
        <Tab color="warning">Spectators</Tab>
      </TabList>
      <TabPanel value={0}>
        <GameLobbyChat />
      </TabPanel>
      <TabPanel value={1}>Invited</TabPanel>
      <TabPanel value={2}>Spectators</TabPanel>
    </Tabs>
  );
}

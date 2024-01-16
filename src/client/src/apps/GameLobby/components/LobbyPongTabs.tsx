import { TabPanel } from '@mui/joy';
import { Tab, TabList, Tabs } from '@mui/joy';
import { LobbyMatchMaking } from './LobbyMatchMaking';
import LobbyCreateCustom from './LobbyCreateCustom';
import LobbyJoinCustom from './LobbyJoinCustom';
import { useParams } from 'wouter';
import { navigate } from 'wouter/use-location';
import React from 'react';
import Link from '@components/Link';
import { useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import PongModel from '@typings/models/pong';
import { LobbySpectateActiveGame } from './LobbySpectateActiveGame';

interface ITab {
  value: string;
  label: string;
  disableIfInLobby?: boolean; // default: false
  disableIfInQueue?: boolean; // default: true
  component: React.ComponentType;
}

const tabs: ITab[] = [
  {
    value: 'queue',
    label: 'Matchmaking',
    component: LobbyMatchMaking,
    disableIfInLobby: true,
    disableIfInQueue: false
  },
  {
    value: 'create',
    label: 'Create Custom',
    component: LobbyCreateCustom,
  },
  {
    value: 'public',
    label: 'Join Custom',
    component: LobbyJoinCustom,
    disableIfInLobby: true,
  },
  {
    value: 'ongoing',
    label: 'Active Games',
    component: LobbySpectateActiveGame,
    disableIfInLobby: true,
  },
];

function LobbyTop() {
  const { tabId } = useParams<{ tabId: string }>();
  const lobbyType = useRecoilValue(pongGamesState.lobbyType);
  const inLobby = !!lobbyType;
  const actualTabs = React.useMemo<ITab[]>(
    () => tabs.filter((tab) => {
      if (inLobby) {
        const inQueue = lobbyType !== PongModel.Models.LobbyType.Custom;
        console.log(inQueue, tab);

        if (inQueue)
          return tab.disableIfInQueue === false;
        if (tab.disableIfInLobby)
          return false;
      }
      return true;
    }),
    [inLobby, lobbyType]
  );
  React.useEffect(() => {
    console.log(tabId);

    if (!actualTabs.some((tab) => tab.value === tabId) && actualTabs.length > 0)
      navigate(`/pong/play/${actualTabs[0].value}`, { replace: true });
  }, [actualTabs, tabId]);

  return (
    <Tabs
      value={tabId ?? tabs[0]?.value}
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'unset',
        width: '100%',
      }}
      color="warning"
    >
      <TabList
        style={{
          borderRadius: 0,
          // '[data-first-child]': {
          //   borderRadius: 0
          // }
        }}
        tabFlex={1}
        color="warning"
      >
        {tabs.map((tab, index) => (
          <Tab
            disabled={!actualTabs.includes(tab)}
            value={tab.value}
            key={index}
            component={Link}
            to={`/pong/play/${tab.value}`}
          >
            {tab.label}
          </Tab>
        ))}
      </TabList>
      {actualTabs.map(({ value: path, component: Component }, index) => (
        <TabPanel key={index} value={path} sx={{ overflow: 'auto' }}>
          {<Component />}
        </TabPanel>
      ))}
    </Tabs>
  );
}

export default LobbyTop;

import { TabPanel } from '@mui/joy';
import { Tab, TabList, Tabs } from '@mui/joy';
import { useParams } from 'wouter';
import { navigate } from 'wouter/use-location';
import React from 'react';
import Link from '@components/Link';
import { useRecoilValue } from 'recoil';
import pongGamesState from '@apps/GameLobby/state';
import { LobbyMatchMaking } from '@apps/GameLobby/components/LobbyMatchMaking';

const tabs: {
  value: string;
  label: string;
  disableIfInLobby?: boolean;
  component: React.ComponentType;
}[] = [
  {
    value: 'queue',
    label: 'Matchmaking',
    component: LobbyMatchMaking,
    disableIfInLobby: false,
  },
];

function ShopTabs() {
  const { tabId } = useParams<{ tabId: string }>();
  const inLobby = useRecoilValue(pongGamesState.isInLobby);
  const actualTabs = React.useMemo(
    () => tabs.filter((tab) => !tab.disableIfInLobby || !inLobby),
    [inLobby]
  );
  React.useEffect(() => {
    console.log(tabId);

    if (!actualTabs.some((tab) => tab.value === tabId))
      navigate(`${actualTabs[0].value}`, { replace: true });
  }, [actualTabs, tabId]);

  return (
    <Tabs
      value={tabId ?? 'queue'}
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
            disabled={tab.disableIfInLobby && inLobby}
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

export default ShopTabs;

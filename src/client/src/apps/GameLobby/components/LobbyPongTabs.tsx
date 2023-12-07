import { TabPanel } from "@mui/joy";
import { Tab, TabList, Tabs } from "@mui/joy";

interface LobbyTopProps {
  tabLabel: string[];
  reactComponents: JSX.Element[];
}

const LobbyTop: React.FC<LobbyTopProps> = ({ tabLabel, reactComponents }) => {
  return (
    <Tabs
      aria-label="Scrollable tabs"
      defaultValue={0}
      sx={{ height: '100%', display: 'flex', justifyContent:'center', backgroundColor: "unset", width: "100%"}}
    >
      <TabList >
        {tabLabel.map((nameTab, index) => (
          <Tab  key={index} sx={{ flex: "none"}}>
            {nameTab}
          </Tab>
        ))}
      </TabList>
      {reactComponents.map((component, index) => (
        <TabPanel  key={index} value={index} style={{flexGrow: 1}}>
          {component}
        </TabPanel>
      ))}
    </Tabs>
  );
}

export default LobbyTop;
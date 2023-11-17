import { TabPanel } from "@mui/joy";
import { Tab, TabList, Tabs } from "@mui/joy";
import LobbyMatchmaking from "./LobbyMatchmaking";

export default function LobbyTop() {
  const myCustomizations: string[] = [
    "Matchmaking",
    "Game Modes",
    "PVP",
    "Create Custom",
    "Join Custom",
  ];
  const components: JSX.Element[] = [<LobbyMatchmaking key={0} />];

  return (
    <Tabs
      aria-label="Scrollable tabs"
      defaultValue={0}
      sx={{ backgroundColor: "unset", width: "100%", height: "100%" }}
    >
      <TabList>
        {myCustomizations.map((nameTab, index) => (
          <Tab key={index} sx={{ flex: "none", scrollSnapAlign: "start" }}>
            {nameTab}
          </Tab>
        ))}
      </TabList>
      {components.map((component, index) => (
        <TabPanel key={index} value={index}>
          {component}
        </TabPanel>
      ))}
    </Tabs>
  );
}

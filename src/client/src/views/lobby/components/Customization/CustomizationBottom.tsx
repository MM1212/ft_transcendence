import * as React from "react";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import { myCustomizations } from "@views/lobby/hardoceTestes";
import { Stack, TabPanel } from "@mui/joy";
import CustomizationBox from "./CustomizationBox";

export default function CustomizationBottom() {
  return (
    <Tabs aria-label="Scrollable tabs" defaultValue={0} sx={{ width: "100%" }}>
      <TabList>
        {myCustomizations.map((nameTab, index) => (
          <Tab key={index} sx={{ flex: "none", scrollSnapAlign: "start" }}>
            {nameTab}
          </Tab>
        ))}
      </TabList>
      <TabPanel value={0} sx={{height:"16em", overflow: "auto" }}>
        <Stack
          direction="row"
          sx={{
            display: "flex",
            width: "100%",
            flexWrap: "wrap",
          }}
        >
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
          <CustomizationBox />
        </Stack>
      </TabPanel>
    </Tabs>
  );
}

import * as React from "react";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import { Stack, TabPanel } from "@mui/joy";
import CustomizationBox from "./CustomizationBox";

export default function CustomizationBottom() {
  const myCustomizations: string[] = [
    "Top Cloth",
    "Bottom Cloth",
    "Shoes",
    "Head",
    "Skin Color",
  ];
  const myImages: string[] = [
    "https://images.unsplash.com/photo-1502657877623-f66bf489d236?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1502657877623-f66bf489d236?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1502657877623-f66bf489d236?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1502657877623-f66bf489d236?auto=format&fit=crop&w=800",
    "https://images.unsplash.com/photo-1502657877623-f66bf489d236?auto=format&fit=crop&w=800",
  ];

  return (
    <Tabs aria-label="Scrollable tabs" defaultValue={0} sx={{ width: "100%" }}>
      <TabList>
        {myCustomizations.map((nameTab, index) => (
          <Tab key={index} sx={{ flex: "none", scrollSnapAlign: "start" }}>
            {nameTab}
          </Tab>
        ))}
      </TabList>
      {myCustomizations.map((_, tabIndex) => (
        <TabPanel
          key={tabIndex}
          value={tabIndex}
          sx={{ height: "16em", overflow: "auto" }}
        >
          <Stack
            direction="row"
            sx={{
              display: "flex",
              width: "100%",
              flexWrap: "wrap",
            }}
          >
            {myImages.map((image, imageIndex) => (
              <CustomizationBox
                key={imageIndex}
                clicable={true}
                imageUrl={image}
              />
            ))}
          </Stack>
        </TabPanel>
      ))}
    </Tabs>
  );
}

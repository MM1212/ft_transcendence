import * as React from "react";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import { Stack, TabPanel } from "@mui/joy";
import CustomizationBox from "./CustomizationBox";
import {
  InventoryCategory,
  getClothIcon,
  inventoryAtom,
  inventoryBoughtCategoryItems,
} from "../state";
import { useRecoilCallback, useRecoilValue } from "recoil";

const categoryTabNames: {
  category: InventoryCategory;
  label: string;
}[] = [
  {
    category: "head",
    label: "Head",
  },
  {
    category: "face",
    label: "Face",
  },
  {
    category: "neck",
    label: "Neck",
  },
  {
    category: "body",
    label: "Body",
  },
  {
    category: "hand",
    label: "Hand",
  },
  {
    category: "feet",
    label: "Feet",
  },
  {
    category: "color",
    label: "Skin Color",
  },
];

function CustomizationItems({ category }: { category: InventoryCategory }) {
  const items = useRecoilValue(inventoryBoughtCategoryItems(category));
  return (
    <Stack
      direction="row"
      sx={{
        display: "flex",
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      {items.map((clothId, imageIndex) => (
        <CustomizationBox
          key={imageIndex}
          clicable={true}
          imageUrl={getClothIcon(clothId)}
        />
      ))}
    </Stack>
  );
}

export default function CustomizationBottom() {
  return (
    <Tabs aria-label="Scrollable tabs" defaultValue={0} sx={{ width: "100%" }}>
      <TabList>
        {categoryTabNames.map((catTabName, index) => (
          <Tab
            value={catTabName.category}
            key={index}
            sx={{ flex: "none", scrollSnapAlign: "start" }}
          >
            {catTabName.label}
          </Tab>
        ))}
      </TabList>
      {categoryTabNames.map((cat, tabIndex) => (
        <TabPanel
          key={tabIndex}
          value={cat.category}
          sx={{ height: "16em", overflow: "auto" }}
        >
          <CustomizationItems category={cat.category} />
        </TabPanel>
      ))}
    </Tabs>
  );
}

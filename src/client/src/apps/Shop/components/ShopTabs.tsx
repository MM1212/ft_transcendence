import { Box, ListItemDecorator, Stack, TabPanel, tabClasses } from "@mui/joy";
import { Tab, TabList, Tabs } from "@mui/joy";
import {
  InventoryCategory,
  categoryTabNames,
  getClothIcon,
  inventoryNotBoughtCategoryItems,
} from "@apps/Customization/state";
import { useRecoilCallback, useRecoilValue } from "recoil";
import ShopCard from "./ShopCard";
import React, { ReactElement } from "react";
import { lobbyAtom, useLobbyPenguinClothes } from "@apps/Lobby/state";
import WizardHatIcon from "@components/icons/WizardHatIcon";
import SafetyGogglesIcon from "@components/icons/SafetyGogglesIcon";
import NecklaceIcon from "@components/icons/NecklaceIcon";
import TshirtVIcon from "@components/icons/TshirtVIcon";
import MixedMartialArtsIcon from "@components/icons/MixedMartialArtsIcon";
import ShoeSneakerIcon from "@components/icons/ShoeSneakerIcon";
import FormatColorFillIcon from "@components/icons/FormatColorFillIcon";

function CustomizationItems({
  category,
  selected,
}: {
  category: InventoryCategory;
  selected: number;
}) {
  const items = useRecoilValue(inventoryNotBoughtCategoryItems(category));
  return (
    <Stack
      position="absolute"
      sx={{
        mt: 2,
        overflowX: "hidden",
        overflowY: "auto",
        flexWrap: "wrap",
        flexDirection: "row",
        alignItems: "top",
        gap: (theme) => theme.spacing(2),
      }}
    >
      {items.map((clothId) => (
        <Box key={clothId}
        sx={{height:'fit-content'}}>
          <ShopCard
            key={clothId}
            selected={clothId === selected}
            imageUrl={getClothIcon(clothId)}
            flex={0.1}
            category={category}
          />
        </Box>
      ))}
    </Stack>
  );
}

function ShopTabs() {
  const iconMapping: ReactElement[] = [
    <WizardHatIcon key={0} />,
    <SafetyGogglesIcon key={1} />,
    <NecklaceIcon key={2} />,
    <TshirtVIcon key={3} />,
    <MixedMartialArtsIcon key={4} />,
    <ShoeSneakerIcon key={5} />,
    <FormatColorFillIcon key={6} />,
  ];

  const inventory = useLobbyPenguinClothes();
  const [index, setIndex] = React.useState(0);
  return (
    <Tabs
      size="lg"
      aria-label="vertical tabs"
      orientation="vertical"
      value={index}
      onChange={(event, value) => setIndex(value as number)}
      sx={(theme) => ({
        borderRadius: 16,
        height: "100%",
        flexDirection: "row",
        mx: "auto",
        boxShadow: theme.shadow.sm,
        [`& .${tabClasses.root}`]: {
          py: 1,
          flex: 1,
          transition: "0.3s",
          fontWeight: "md",
          fontSize: "md",
          [`&:not(.${tabClasses.selected}):not(:hover)`]: {
            opacity: 0.7,
          },
        },
      })}
    >
      <TabList
        variant="plain"
        size="sm"
        sx={{ mt:4.5, borderRadius: "lg", p: 0, height: 2, gap: 2 }}
      >
        {categoryTabNames.map((catTabName, index) => (
          <Tab
            value={index}
            key={index}
            sx={{
              width: 200,
              gap: 2,
            }}
          >
            {iconMapping[index]}
            {catTabName.label}
          </Tab>
        ))}
      </TabList>
      {categoryTabNames.map((cat, tabIndex) => (
        <TabPanel
          key={tabIndex}
          value={tabIndex}
          sx={{ overflow: "auto", width:'100%', height: "90vh"}}
        >
          <CustomizationItems
            category={cat.category}
            selected={inventory[cat.category]}
          />
        </TabPanel>
      ))}
    </Tabs>
  );
}

export default ShopTabs;

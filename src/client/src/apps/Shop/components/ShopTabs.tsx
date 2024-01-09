import {
  Box,
  Chip,
  ListItemDecorator,
  Stack,
  TabPanel,
  Typography,
  tabClasses,
} from "@mui/joy";
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
import { useCurrentUser } from "@hooks/user";
import { randomInt } from "@utils/random";
import { Sheet } from "@mui/joy";
import CurrencyTwdIcon from "@components/icons/CurrencyTwdIcon";
import { Tooltip } from "@mui/joy";

function CustomizationItems({
  category,
  credits
}: {
  category: InventoryCategory;
  credits: number
}) {
  const items = useRecoilValue(inventoryNotBoughtCategoryItems(category));
  return (
    <Box
      display="flex"
      mt={2}
      flexWrap="wrap"
      alignItems="flex-start"
      gap={(theme) => theme.spacing(2)}
    >
      {items.map((clothId) => (
        <Box key={clothId} sx={{ height: "fit-content" }}>
          <ShopCard
            key={clothId}
            imageUrl={getClothIcon(clothId)}
            category={category}
            itemId={clothId}
            canBuy={credits >= 100}
          />
        </Box>
      ))}
    </Box>
  );
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 3,
});

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

  const user = useCurrentUser();
  if (!user) {
    return null;
  }
  return (
    <Tabs
      size="lg"
      aria-label="vertical tabs"
      orientation="vertical"
      sx={(theme) => ({
        height: "100%",
        mx: "auto",
        width: "100%",
        boxShadow: theme.shadow.sm,
        [`& .${tabClasses.root}`]: {
          py: 1,
          transition: (theme) => theme.transitions.create("opacity"),
          [`&:not(.${tabClasses.selected}):not(:hover)`]: {
            opacity: 0.7,
          },
        },
      })}
    >
      <TabList
        variant="plain"
        size="sm"
        sx={{ height: "100%", borderRadius: "md", p: 1, gap: 1, width: "20%" }}
      >
        <Stack spacing={1} width="100%">
          <Typography level="h3">Shop</Typography>
        </Stack>
        {categoryTabNames.map((catTabName, index) => (
          <Tab
            value={index}
            key={index}
            disableIndicator
            sx={{
              gap: 2,
            }}
          >
            {iconMapping[index]}
            {catTabName.label}
          </Tab>
        ))}
        <Sheet
          variant="outlined"
          sx={{
            mt: "auto",
            width: "100%",
            p: 1,
            borderRadius: "md",
            backgroundColor: "background.level1",
          }}
        >
          <Box
            display="flex"
            width="100%"
            flexGrow={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography level="title-sm">Credits:</Typography>
            <Tooltip title={user.credits}>
            <Chip
              startDecorator={<CurrencyTwdIcon/>}
              color="success"
            >
              {numberFormatter.format(user.credits)}
            </Chip>
            </Tooltip>
          </Box>
        </Sheet>
      </TabList>
      {categoryTabNames.map((cat, tabIndex) => (
        <TabPanel
          key={tabIndex}
          value={tabIndex}
          sx={{
            flexGrow: 0,
            width: "80%",
            height: "100%",
            backgroundColor: "background.level1",
            overflowY: 'auto'
          }}
        >
          <CustomizationItems
            category={cat.category}
            credits={user.credits}
          />
        </TabPanel>
      ))}
    </Tabs>
  );
}

export default ShopTabs;

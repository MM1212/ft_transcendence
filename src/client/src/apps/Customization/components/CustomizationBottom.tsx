import * as React from 'react';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import { Stack, TabPanel } from '@mui/joy';
import CustomizationBox from './CustomizationBox';
import {
  InventoryCategory,
  categoryTabNames,
  getClothIcon,
  useClothingItemsBoughtByCategory,
} from '../state';
import { Box } from '@mui/joy';
import { useLobbyPenguinClothes } from '@apps/Lobby/state';

function CustomizationItems({
  category,
  selected,
  updateCloth,
  disabled = false,
}: {
  category: InventoryCategory;
  selected: number;
  updateCloth: (piece: InventoryCategory, id: number) => void;
  disabled?: boolean;
}) {
  const items = useClothingItemsBoughtByCategory(category);
  return (
    <Stack
      direction="row"
      sx={{
        display: 'flex',
        width: '100%',
        flexWrap: 'wrap',
        gap: 1.2,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            aspectRatio: '1/1',
            width: '8.7dvh',
          }}
        >
          <CustomizationBox
            selected={item.meta.clothId === selected}
            imageUrl={getClothIcon(item.meta.clothId)}
            flex={0.1}
            onClick={() => updateCloth(category, item.meta.clothId)}
            disabled={disabled}
          />
        </Box>
      ))}
    </Stack>
  );
}

export default function CustomizationBottom({
  updateCloth,
  isLobbyLoading,
}: {
  updateCloth: (piece: InventoryCategory, id: number) => void;
  isLobbyLoading: boolean;
}) {
  const inventory = useLobbyPenguinClothes();
  return (
    <Tabs
      aria-label="Scrollable tabs"
      defaultValue={categoryTabNames[0].category}
      sx={{ width: '100%', borderRadius: 0 }}
    >
      <TabList
        style={{
          borderRadius: 0,
        }}
      >
        {categoryTabNames.map((catTabName, index) => (
          <Tab
            value={catTabName.category}
            key={index}
            sx={{ flex: 'none', scrollSnapAlign: 'start' }}
          >
            {catTabName.label}
          </Tab>
        ))}
      </TabList>
      {categoryTabNames.map((cat, tabIndex) => (
        <TabPanel
          key={tabIndex}
          value={cat.category}
          sx={{ overflow: 'auto', height: '24dvh' }}
        >
          <CustomizationItems
            category={cat.category}
            selected={inventory[cat.category]}
            updateCloth={updateCloth}
            disabled={isLobbyLoading}
          />
        </TabPanel>
      ))}
    </Tabs>
  );
}

import * as React from 'react';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import { Stack, TabPanel } from '@mui/joy';
import CustomizationBox from './CustomizationBox';
import {
  InventoryCategory,
  getClothIcon,
  inventoryAtom,
  inventoryBoughtCategoryItems,
} from '../state';
import { useRecoilValue } from 'recoil';
import { Box } from '@mui/joy';

const categoryTabNames: {
  category: InventoryCategory;
  label: string;
}[] = [
  {
    category: 'head',
    label: 'Head',
  },
  {
    category: 'face',
    label: 'Face',
  },
  {
    category: 'neck',
    label: 'Neck',
  },
  {
    category: 'body',
    label: 'Body',
  },
  {
    category: 'hand',
    label: 'Hand',
  },
  {
    category: 'feet',
    label: 'Feet',
  },
  {
    category: 'color',
    label: 'Skin Color',
  },
];

function CustomizationItems({
  category,
  selected,
  updateCloth
}: {
  category: InventoryCategory;
  selected: number;
  updateCloth: (piece: InventoryCategory, id: number) => void;
}) {
  const items = useRecoilValue(inventoryBoughtCategoryItems(category));
  return (
    <Stack
      direction="row"
      sx={{
        display: 'flex',
        width: '100%',
        flexWrap: 'wrap',
        gap: (theme) => theme.spacing(1.2),
      }}
    >
      {items.map((clothId) => (
        <Box
          key={clothId}
          sx={{
            aspectRatio: '1/1',
            width: '8.7dvh',
          }}
        >
          <CustomizationBox
            key={clothId}
            selected={clothId === selected}
            imageUrl={getClothIcon(clothId)}
            flex={0.1}
            onClick={() => updateCloth(category, clothId)}
          />
        </Box>
      ))}
    </Stack>
  );
}

export default function CustomizationBottom({
  updateCloth,
}: {
  updateCloth: (piece: InventoryCategory, id: number) => void;
}) {
  const inventory = useRecoilValue(inventoryAtom);
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
            selected={inventory.selected[cat.category]}
            updateCloth={updateCloth}
          />
        </TabPanel>
      ))}
    </Tabs>
  );
}

import {
  Box,
  Chip,
  Stack,
  SvgIconProps,
  TabPanel,
  Typography,
  tabClasses,
} from '@mui/joy';
import { Tab, TabList, Tabs } from '@mui/joy';
import {
  InventoryCategory,
  categoryTabNames,
  getClothIcon,
  inventoryNotBoughtCategoryItems,
} from '@apps/Customization/state';
import { useRecoilValue } from 'recoil';
import ShopCard from './ShopCard';
import React from 'react';
import SafetyGogglesIcon from '@components/icons/SafetyGogglesIcon';
import NecklaceIcon from '@components/icons/NecklaceIcon';
import TshirtVIcon from '@components/icons/TshirtVIcon';
import MixedMartialArtsIcon from '@components/icons/MixedMartialArtsIcon';
import ShoeSneakerIcon from '@components/icons/ShoeSneakerIcon';
import FormatColorFillIcon from '@components/icons/FormatColorFillIcon';
import { useCurrentUser } from '@hooks/user';
import { Sheet } from '@mui/joy';
import CurrencyTwdIcon from '@components/icons/CurrencyTwdIcon';
import { Tooltip } from '@mui/joy';
import AppsIcon from '@components/icons/AppsIcon';
import ShopModel from '@typings/models/shop';
import { useShopCategories, useShopSubCategories } from '../hooks';
import ErrorBoundary from '@components/ExceptionCatcher';

function CustomizationItems({
  category,
  credits,
}: {
  category: InventoryCategory;
  credits: number;
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
        <Box key={clothId} sx={{ height: 'fit-content' }}>
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

const numberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 3,
});

function ShopSubCategoryTab(subCategory: ShopModel.Models.SubCategory) {
  return (
    <Tab
      value={subCategory.id}
      disableIndicator
      sx={{
        gap: 1,
        width: '100%',
      }}
    >
      <React.Suspense fallback={<></>}>
        {<subCategory.Icon size="sm" />}
      </React.Suspense>
      {subCategory.label}
    </Tab>
  );
}

function _ShopCategoryTab(category: ShopModel.Models.Category) {
  const subCategories = useShopSubCategories(category.id);

  return React.useMemo(
    () => (
      <Box mb={1}>
        <Typography
          level="body-xs"
          startDecorator={<category.Icon size="xs" />}
        >
          {category.label}
        </Typography>
        {subCategories.map((sub, i) => (
          <Box key={sub.id} mt={i === 0 ? 0.5 : 1} width="100%" display="flex">
            <ShopSubCategoryTab {...sub} />
          </Box>
        ))}
      </Box>
    ),
    [category, subCategories]
  );
}

const ShopCategoryTab = React.memo(_ShopCategoryTab);

function ShopTabs() {
  const user = useCurrentUser();
  const categories = useShopCategories();
  if (!user) {
    return null;
  }
  return (
    <Tabs
      size="lg"
      aria-label="vertical tabs"
      orientation="vertical"
      defaultValue={categories[0].subCategories[0]}
      sx={(theme) => ({
        height: '100%',
        mx: 'auto',
        width: '100%',
        boxShadow: theme.shadow.sm,
        [`& .${tabClasses.root}`]: {
          py: 1,
          transition: (theme) => theme.transitions.create('opacity'),
          [`&:not(.${tabClasses.selected}):not(:hover)`]: {
            opacity: 0.7,
          },
        },
      })}
    >
      <TabList
        variant="plain"
        size="sm"
        sx={{ height: '100%', borderRadius: 'md', p: 1, width: '20%' }}
      >
        <Stack spacing={1} width="100%" mb={1}>
          <Typography level="h3">Shop</Typography>
        </Stack>
        <React.Suspense fallback={<></>}>
          {categories.map((cat) => (
            <ShopCategoryTab key={cat.id} {...cat} />
          ))}
        </React.Suspense>
        <Sheet
          variant="outlined"
          sx={{
            mt: 'auto',
            width: '100%',
            p: 1,
            borderRadius: 'md',
            backgroundColor: 'background.level1',
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
              <Chip startDecorator={<CurrencyTwdIcon />} color="success">
                {numberFormatter.format(user.credits)}
              </Chip>
            </Tooltip>
          </Box>
        </Sheet>
      </TabList>
      {/* {categoryTabNames.map((cat, tabIndex) => (
        <TabPanel
          key={tabIndex}
          value={tabIndex}
          sx={{
            flexGrow: 0,
            width: '80%',
            height: '100%',
            backgroundColor: 'background.level1',
            overflowY: 'auto',
          }}
        >
          <CustomizationItems category={cat.category} credits={user.credits} />
        </TabPanel>
      ))} */}
    </Tabs>
  );
}

export default ShopTabs;

import {
  Box,
  Chip,
  Grid,
  Stack,
  TabPanel,
  Typography,
  tabClasses,
} from '@mui/joy';
import { Tab, TabList, Tabs } from '@mui/joy';
import ShopCard from './ShopCard';
import React from 'react';
import { useCurrentUser } from '@hooks/user';
import { Sheet } from '@mui/joy';
import CurrencyTwdIcon from '@components/icons/CurrencyTwdIcon';
import { Tooltip } from '@mui/joy';
import ShopModel from '@typings/models/shop';
import {
  useShopCategories,
  useShopItems,
  useShopSubCategories,
  useShopSubCategory,
  useShopSubCategoryPage,
} from '../hooks';
import { useInventoryByType } from '@apps/Inventory/hooks/useInventory';
import { numberExtentFormatter, numberFormatter } from '@lib/intl';
import Pagination from '@components/Pagination';
import GenericPlaceholder from '@components/GenericPlaceholder';
import CartOffIcon from '@components/icons/CartOffIcon';

const ITEMS_PER_PAGE = 6;

function CustomizationItems({
  category: categoryId,
  subCategory: subCategoryId,
  credits,
}: {
  category: string;
  subCategory: string;
  credits: number;
}) {
  const items = useShopItems(categoryId, subCategoryId);
  const subCategory = useShopSubCategory(categoryId, subCategoryId);
  const inventory = useInventoryByType(`${categoryId}-${subCategoryId}`);
  const [page, setPage] = useShopSubCategoryPage(categoryId, subCategoryId);
  const paginatedItems = React.useMemo(
    () =>
      [...new Array(ITEMS_PER_PAGE)]
        .map((_, i) => items[i + (page - 1) * ITEMS_PER_PAGE])
        .filter(Boolean),
    [items, page]
  );
  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      gap={2}
      alignItems="center"
    >
      <Stack direction="row" spacing={0.5} alignItems="center" width="100%">
        <subCategory.Icon size="lg" />
        <Typography level="h3">{subCategory.label}</Typography>
      </Stack>
      <Grid container spacing={2} flexGrow={1} overflow="auto" width="100%">
        {paginatedItems.length > 0 ? (
          paginatedItems.map((item) => (
            <Grid xs={4} key={item.id}>
              <ShopCard
                key={item.id}
                canBuy={credits >= item.price}
                owned={inventory.some((i) => i.name === item.id)}
                {...item}
              />
            </Grid>
          ))
        ) : (
          <Grid xs={12}>
            <GenericPlaceholder
              icon={<CartOffIcon />}
              title="No items available"
              centerVertical
            />
          </Grid>
        )}
      </Grid>
      <Sheet
        sx={{
          p: 0.5,
          borderRadius: 'md',
        }}
      >
        <Pagination
          count={Math.ceil(items.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={(_, page) => setPage(page)}
          color="neutral"
          variant="plain"
          showFirstButton
          showLastButton
        />
      </Sheet>
    </Box>
  );
}

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
        sx={{ height: '100%', borderRadius: 'md', p: 1, width: '25%' }}
      >
        <Stack spacing={1} width="100%" mb={1}>
          <Typography level="h3">Shop</Typography>
        </Stack>
        <Box
          display="flex"
          overflow="hidden auto"
          flexDirection="column"
          pr={1}
          flexGrow={1}
          mb={1}
        >
          <React.Suspense fallback={<></>}>
            {categories.map((cat) => (
              <ShopCategoryTab key={cat.id} {...cat} />
            ))}
          </React.Suspense>
        </Box>
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
            <Tooltip title={numberExtentFormatter.format(user.credits)}>
              <Chip startDecorator={<CurrencyTwdIcon />} color="success">
                {numberFormatter.format(user.credits)}
              </Chip>
            </Tooltip>
          </Box>
        </Sheet>
      </TabList>
      {categories.map((cat) =>
        cat.subCategories.map((sub) => (
          <TabPanel
            key={`${cat.id}-${sub}`}
            value={sub}
            sx={{
              flexGrow: 0,
              width: '80%',
              height: '100%',
              backgroundColor: 'background.level1',
            }}
          >
            <CustomizationItems
              category={cat.id}
              subCategory={sub}
              credits={user.credits}
            />
          </TabPanel>
        ))
      )}
    </Tabs>
  );
}

export default ShopTabs;

import GenericPlaceholder from '@components/GenericPlaceholder';
import Pagination from '@components/Pagination';
import BugIcon from '@components/icons/BugIcon';
import CartIcon from '@components/icons/CartIcon';
import FilterIcon from '@components/icons/FilterIcon';
import MagnifyIcon from '@components/icons/MagnifyIcon';
import MenuOption from '@components/menu/MenuOption';
import { useDebounce, useDebouncedValue } from '@hooks/lodash';
import { buildTunnelEndpoint, jsonFetcher } from '@hooks/tunnel';
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  Dropdown,
  IconButton,
  Input,
  Menu,
  MenuButton,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import type { ClothingItem } from '@typings/lobby/dev/clothing';
import React from 'react';
import useSWR from 'swr';

interface Filter {
  query: string;
  showAddedToShop: boolean;
  showProbablyBroken: boolean;
}

const getIconAssetPath = (id: number) =>
  `${
    import.meta.env.FRONTEND_PUBLIC_CDN_URL
  }/client/dist/assets/media/clothing/icon/${id}.webp`;

const ItemEntry = React.memo(function ItemEntry(
  item: ClothingItem
): JSX.Element {
  return (
    <Sheet
      key={item.id}
      variant="outlined"
      sx={{
        p: 1,
        borderRadius: 'md',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        bgcolor: 'background.level1',
        flex: '0 0 14dvh',
        flexGrow: 0,
      }}
    >
      <Box
        sx={{
          maxHeight: '8dvh',
          aspectRatio: '1 / 1',
          mx: 2,
          p: 0.25,
          bgcolor: 'background.level2',
          border: '2px solid',
          borderColor: 'divider',
          borderRadius: 'md',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src={getIconAssetPath(item.id)}
          alt={item.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'scale-down',
          }}
          loading="lazy"
        />
      </Box>
      <Typography level="body-sm" textAlign="center" width="10dvh" noWrap>
        {item.name}
      </Typography>
      <Typography level="body-xs" textAlign="center">
        (ID: {item.id})
      </Typography>
    </Sheet>
  );
});

function Header({
  itemCount,
  filter,
  setFilter,
}: {
  itemCount: number;
  filter: Filter;
  setFilter: React.Dispatch<React.SetStateAction<Filter>>;
}): JSX.Element {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      px={1}
      alignItems="center"
    >
      <Typography level="h4" textAlign="center">
        Clothing Items{' '}
        <Chip variant="soft" color="success">
          {itemCount}
        </Chip>
      </Typography>
      <Input
        placeholder="Search by name or ID"
        value={filter.query}
        onChange={(e) =>
          setFilter((prev) => ({ ...prev, query: e.target.value }))
        }
        color="neutral"
        startDecorator={<MagnifyIcon />}
        sx={{
          '--Input-focusedHighlight': (theme) =>
            `${theme.getCssVar('palette-success-outlinedBorder')} !important`,
          '--Input-focusedThickness': '1px',
        }}
        endDecorator={
          <>
            <Divider orientation="vertical" />
            <Dropdown>
              <MenuButton
                slots={{ root: IconButton }}
                slotProps={{
                  root: {
                    variant: 'plain',
                    color: 'success',
                    sx: {
                      mr: -1,
                      ml: 0.25,
                      '&:hover': { bgcolor: 'transparent' },
                    },
                  },
                }}
              >
                <FilterIcon />
              </MenuButton>
              <Menu placement="right-start" size="sm" sx={{ zIndex: 1300 }}>
                <MenuOption
                  icon={CartIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter((prev) => ({
                      ...prev,
                      showAddedToShop: !prev.showAddedToShop,
                    }));
                  }}
                  selected={filter.showAddedToShop}
                >
                  <Typography level="body-sm">Show added to shop</Typography>
                </MenuOption>
                <MenuOption
                  icon={BugIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter((prev) => ({
                      ...prev,
                      showProbablyBroken: !prev.showProbablyBroken,
                    }));
                  }}
                  selected={filter.showProbablyBroken}
                >
                  <Typography level="body-sm">Show probably broken</Typography>
                </MenuOption>
              </Menu>
            </Dropdown>
          </>
        }
      />
    </Box>
  );
}

function ClothingItemEntries(): JSX.Element {
  const {
    data: clothingItems,
    error,
    isLoading,
  } = useSWR<ClothingItem[]>(
    buildTunnelEndpoint('/dev/clothing' as any),
    jsonFetcher
  );

  const PAGE_SIZE = 25;
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<Filter>({
    query: '',
    showAddedToShop: false,
    showProbablyBroken: true,
  });
  const filteredItems = React.useMemo(() => {
    console.log('filterItems', clothingItems, filter);

    if (!clothingItems) return [];
    const filtered = clothingItems.filter((item) => {
      if (filter.query.trim().length > 0) {
        if (!item.name.toLowerCase().includes(filter.query.toLowerCase()))
          return false;
      }
      if (!filter.showAddedToShop && item.in_shop) return false;
      if (!filter.showProbablyBroken) {
        const { icon, paper, sprites } = item.props;
        if (!icon || !paper || !sprites) return false;
      }
      return true;
    });
    console.log('filtered', filtered.length);

    return filtered;
  }, [clothingItems, filter]);
  const items = React.useMemo(
    () =>
      !filteredItems
        ? []
        : [...new Array(PAGE_SIZE)]
            .map((_, i) => filteredItems[i + (page - 1) * PAGE_SIZE])
            .filter(Boolean),
    [filteredItems, page]
  );
  const handlePageChange = (_: any, value: number) => setPage(value);
  if (isLoading) {
    return <CircularProgress variant="plain" sx={{ m: 'auto' }} />;
  }
  if (!clothingItems || error) {
    return (
      <GenericPlaceholder
        icon={<BugIcon fontSize="xl4" />}
        title="Error"
        label={error.message}
      />
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      height="100%"
      gap={2}
    >
      <Header
        itemCount={filteredItems.length}
        filter={filter}
        setFilter={setFilter}
      />
      <Box flexGrow={1} overflow="auto">
        <Box
          display="flex"
          width="100%"
          flexWrap={'wrap'}
          justifyContent="flex-start"
          alignItems="flex-start"
          gap={1}
        >
          {items.map((item) => (
            <ItemEntry key={item.id} {...item} />
          ))}
        </Box>
      </Box>
      <Pagination
        count={Math.ceil(filteredItems.length / PAGE_SIZE)}
        page={page}
        siblingCount={1}
        boundaryCount={1}
        onChange={handlePageChange}
        showFirstButton
        showLastButton
        size="sm"
        variant="outlined"
        color="neutral"
        sx={{ m: 'auto' }}
      />
    </Box>
  );
}

export default function ClothingItemsDev() {
  return (
    <Sheet
      sx={{
        p: 2,
        height: '100%',
        width: '80dvh',
        overflow: 'auto',
        borderLeft: '1px solid',
        borderColor: 'divider',
      }}
    >
      <ClothingItemEntries />
    </Sheet>
  );
}

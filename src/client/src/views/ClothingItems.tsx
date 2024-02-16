import { IS_PROD } from '@apps/Lobby/src/constants';
import GenericPlaceholder from '@components/GenericPlaceholder';
import Link from '@components/Link';
import Pagination from '@components/Pagination';
import AlertIcon from '@components/icons/AlertIcon';
import BoxingGloveIcon from '@components/icons/BoxingGloveIcon';
import BugIcon from '@components/icons/BugIcon';
import CartIcon from '@components/icons/CartIcon';
import CartPlusIcon from '@components/icons/CartPlusIcon';
import CheckIcon from '@components/icons/CheckIcon';
import CurrencyTwdIcon from '@components/icons/CurrencyTwdIcon';
import FilterIcon from '@components/icons/FilterIcon';
import FormatColorFillIcon from '@components/icons/FormatColorFillIcon';
import ImageTextIcon from '@components/icons/ImageTextIcon';
import LabelIcon from '@components/icons/LabelIcon';
import MagnifyIcon from '@components/icons/MagnifyIcon';
import SafetyGogglesIcon from '@components/icons/SafetyGogglesIcon';
import ShapeIcon from '@components/icons/ShapeIcon';
import ShoeSneakerIcon from '@components/icons/ShoeSneakerIcon';
import TshirtCrewIcon from '@components/icons/TshirtCrewIcon';
import WizardHatIcon from '@components/icons/WizardHatIcon';
import MenuOption from '@components/menu/MenuOption';
import { useSseEvent } from '@hooks/sse';
import {
  buildTunnelEndpoint,
  jsonFetcher,
  useTunnelEndpoint,
} from '@hooks/tunnel';
import { useModal, useModalActions } from '@hooks/useModal';
import notifications from '@lib/notifications/hooks';
import tunnel from '@lib/tunnel';
import { Button, Grid, ModalClose } from '@mui/joy';
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Divider,
  Dropdown,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Menu,
  MenuButton,
  Modal,
  ModalDialog,
  Option,
  Select,
  Sheet,
  Stack,
  Tooltip,
  Typography,
  type SvgIconProps,
} from '@mui/joy';
import { alpha } from '@theme';
import type { ClothingItem } from '@typings/lobby/dev/clothing';
import LobbyModel from '@typings/models/lobby';
import { randomInt } from '@utils/random';
import React from 'react';
import { atom, useRecoilState } from 'recoil';
import { mutate } from 'swr';

interface DevClothingListModalState {
  item: ClothingItem;
  backItem: boolean;
}

export const useDevClothingListService = () => {
  if (IS_PROD) return;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useSseEvent(
    'shop-sync',
    () => void mutate(buildTunnelEndpoint('/dev/clothing' as any))
  );
};

const DEV_CLOTHING_LIST_MODAL_ID = 'lobby:clothing:add-to-shop';

const useDevClothingListModal = () =>
  useModal<DevClothingListModalState>(DEV_CLOTHING_LIST_MODAL_ID);

const useDevClothingListModalActions = () =>
  useModalActions<DevClothingListModalState>(DEV_CLOTHING_LIST_MODAL_ID);

interface Filter {
  query: string;
  showAddedToShop: boolean;
  showProbablyBroken: boolean;
}

const getIconAssetPath = (id: number) =>
  `${
    import.meta.env.FRONTEND_PUBLIC_CDN_URL
  }/client/dist/assets/media/clothing/icon/${id}.webp`;

const priceTableCap: Record<
  LobbyModel.Models.InventoryCategory,
  [number, number]
> = {
  head: [100, 1000],
  face: [100, 1000],
  neck: [100, 1000],
  body: [100, 1000],
  hand: [100, 1000],
  feet: [100, 1000],
  color: [100, 100],
};

const categories: {
  value: LobbyModel.Models.InventoryCategory;
  label: string;
  icon: React.ComponentType<SvgIconProps>;
}[] = [
  { value: 'head', label: 'Head', icon: WizardHatIcon },
  { value: 'body', label: 'Body', icon: TshirtCrewIcon },
  { value: 'hand', label: 'Hand', icon: BoxingGloveIcon },
  { value: 'feet', label: 'Feet', icon: ShoeSneakerIcon },
  { value: 'face', label: 'Face', icon: SafetyGogglesIcon },
  { value: 'color', label: 'Color', icon: FormatColorFillIcon },
];

const lastCategoryChosenAtom = atom<LobbyModel.Models.InventoryCategory | null>(
  {
    key: 'lastCategoryChosen',
    default: null,
  }
);

function AddClothingToShopModalForm(): JSX.Element {
  const { data, setData, close } = useDevClothingListModal();
  const [itemName, setItemName] = React.useState(data.item.name);
  const [itemDescription, setItemDescription] = React.useState('');
  const [itemCategory, setItemCategory] =
    React.useState<LobbyModel.Models.InventoryCategory | null>(null);

  const computeNewPrice = (
    category: LobbyModel.Models.InventoryCategory | null
  ) => (!category ? '0' : randomInt(...priceTableCap[category]).toString());

  const [itemPrice, setItemPrice] = React.useState<string>(() =>
    computeNewPrice(itemCategory)
  );
  const [lastCategoryChosen, setLastCategoryChosen] = useRecoilState(
    lastCategoryChosenAtom
  );
  React.useEffect(() => {
    setItemName(data.item.name);
    setItemDescription(data.item.shop?.description ?? '');
    setItemCategory(
      (data.item.shop?.subCategory as LobbyModel.Models.InventoryCategory) ??
        lastCategoryChosen
    );
    setItemPrice(
      computeNewPrice(
        (data.item.shop?.subCategory as LobbyModel.Models.InventoryCategory) ??
          lastCategoryChosen
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.item]);

  React.useEffect(() => {
    setItemPrice(computeNewPrice(itemCategory));
  }, [itemCategory]);

  const error =
    isNaN(parseInt(itemPrice)) || parseInt(itemPrice) < 0 || !itemCategory;
  const [loading, setLoading] = React.useState(false);
  const submit = React.useCallback(async () => {
    if (error || !itemCategory) return;
    const item: ClothingItem = {
      id: data.item.id,
      in_shop: false,
      name: itemName,
      shop: {
        description: itemDescription,
        price: parseInt(itemPrice),
        subCategory: itemCategory,
      },
      props: {
        ...data.item.props,
        back_item: data.backItem,
      },
    };
    try {
      setLoading(true);
      await tunnel.put(`/dev/clothing/:id` as any, item, {
        id: data.item.id,
      });
      close();
      notifications.success(
        'New Item Added',
        `Item ${itemName} added to shop for ${itemPrice} credits!`
      );
    } catch (e) {
      notifications.error('Failed to add item to shop', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [
    error,
    data.item.id,
    data.item.props,
    data.backItem,
    itemName,
    itemDescription,
    itemPrice,
    itemCategory,
    close,
  ]);

  return (
    <Box gap={2} display="flex" flexDirection="column" mt={2} flexGrow={1}>
      <Stack direction="row" spacing={2}>
        <Typography level="title-md">
          Item: <Typography level="body-lg">{itemName}</Typography>
        </Typography>
      </Stack>
      <FormControl required>
        <FormLabel>Item Name</FormLabel>
        <Input
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item's name"
          color="neutral"
          startDecorator={<LabelIcon />}
        />
      </FormControl>
      <FormControl required>
        <FormLabel>Item Description</FormLabel>
        <Input
          value={itemDescription}
          onChange={(e) => setItemDescription(e.target.value)}
          placeholder="Item's description"
          color="neutral"
          startDecorator={<ImageTextIcon />}
        />
      </FormControl>
      <Stack direction="row" spacing={1} alignItems="center">
        <FormControl required sx={{ width: '50%' }}>
          <FormLabel>
            Category{' '}
            <Typography
              level="body-xs"
              component={Link}
              href={`https://clubpenguin.fandom.com/wiki/Special:Search?query=${itemName
                .split(' ')
                .join('+')}&scope=internal&navigationSearch=true`}
              target="_blank"
            >
              (Check here)
            </Typography>
          </FormLabel>
          <Select
            value={itemCategory}
            onChange={(_, value) => {
              if (!value) return;
              setItemCategory(value);
              setLastCategoryChosen(value);
            }}
            color="neutral"
            startDecorator={<ShapeIcon />}
          >
            {categories.map(({ value, label, icon: Icon }) => (
              <Option
                value={value}
                key={value}
                label={
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Icon size="md" />
                    <Typography level="body-md" component="div">
                      {label}
                    </Typography>
                  </Stack>
                }
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Icon size="md" />
                  <Typography level="body-md" component="div">
                    {label}
                  </Typography>
                </Stack>
              </Option>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ width: '50%' }}>
          <FormLabel>Back Item Sprite</FormLabel>
          <Checkbox
            checked={data.backItem}
            onChange={() => setData({ ...data, backItem: !data.backItem })}
            label="Is back item?"
          />
        </FormControl>
      </Stack>
      <FormControl
        required
        error={isNaN(parseInt(itemPrice)) || parseInt(itemPrice) < 0}
      >
        <FormLabel>Price</FormLabel>
        <Input
          type="number"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          placeholder="Item's price"
          color="neutral"
          startDecorator={<CurrencyTwdIcon />}
        />
      </FormControl>
      <Button color="primary" sx={{ mt: 3 }} loading={loading} onClick={submit}>
        Submit
      </Button>
    </Box>
  );
}

function AddClothingToShopModalPreview(): JSX.Element {
  const { data } = useDevClothingListModal();
  const toRenderImgs = [
    [
      `${
        import.meta.env.FRONTEND_PUBLIC_CDN_URL
      }/client/dist/assets/media/clothing/icon/${data.item.id}.webp`,
      'icon',
    ],
    [
      `${
        import.meta.env.FRONTEND_PUBLIC_CDN_URL
      }/client/dist/assets/media/clothing/paper/${data.item.id}.webp`,
      'paper',
    ],
    [
      `${
        import.meta.env.FRONTEND_PUBLIC_CDN_URL
      }/client/dist/assets/media/clothing/sprites/${data.item.id}-0.webp`,
      'sprites',
    ],
    [
      `${
        import.meta.env.FRONTEND_PUBLIC_CDN_URL
      }/client/dist/assets/media/clothing/paper/${data.item.id}_back.webp`,
      'paper back',
    ],
  ];

  return (
    <Grid container spacing={2}>
      {toRenderImgs.map(([url, label]) => (
        <Grid key={label} xs={6}>
          <Sheet
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
              width: '100%',
            }}
          >
            <img
              src={url}
              alt={label}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                objectFit: 'scale-down',
              }}
              loading="lazy"
            />
            <Typography level="body-md" textAlign="center">
              {label}
            </Typography>
          </Sheet>
        </Grid>
      ))}
    </Grid>
  );
}

function AddClothingToShopModal(): JSX.Element {
  const { isOpened, close } = useDevClothingListModal();
  return (
    <Modal open={isOpened} onClose={close}>
      <ModalDialog minWidth="md" maxWidth="lg">
        <ModalClose />
        <DialogTitle>Add to shop</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            gap: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box width="45%" height="100%">
            <AddClothingToShopModalForm />
          </Box>
          <Divider orientation="vertical" />
          <Box width="45%">
            <AddClothingToShopModalPreview />
          </Box>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}

function ItemEntryWarnings(item: ClothingItem) {
  if (item.in_shop)
    return (
      <Tooltip title="Already in shop">
        <Sheet
          sx={{
            // position: 'absolute',
            // top: 0,
            // right: 0,
            // mt: '-14%',
            // mr: '-14%',
            px: 0.75,
            borderRadius: 'xl',
            border: '2px solid',
            borderColor: 'divider',
            bgcolor: 'background.surface',
          }}
          variant="outlined"
        >
          <CheckIcon color="success" size="xs" />
        </Sheet>
      </Tooltip>
    );
  const warnings = [];
  if (!item.props.icon) warnings.push('Icon missing');
  if (!item.props.paper) warnings.push('Paper missing');
  if (!item.props.sprites) warnings.push('Sprites missing');
  if (warnings.length === 0) return null;
  return (
    <Tooltip
      title={
        <Stack direction="row" gap={0.5}>
          {warnings.map((warning) => (
            <Chip
              key={warning}
              variant="soft"
              color="danger"
              startDecorator={<AlertIcon />}
            >
              {warning}
            </Chip>
          ))}
        </Stack>
      }
      size="lg"
    >
      <Sheet
        sx={{
          // position: 'absolute',
          // top: 0,
          // right: 0,
          // mt: '-14%',
          // mr: '-14%',
          px: 0.75,
          borderRadius: 'xl',
          border: '2px solid',
          borderColor: 'divider',
          bgcolor: 'background.surface',
        }}
        variant="outlined"
      >
        <AlertIcon color="warning" size="xs" />
      </Sheet>
    </Tooltip>
  );
}

function ItemEntryAddToShop({
  item,
  hovered,
}: {
  item: ClothingItem;
  hovered: boolean;
}) {
  const { open } = useDevClothingListModalActions();
  if (!hovered) return null;
  return (
    <Sheet
      sx={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        border: '2px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(2px)',
        bgcolor: (theme) =>
          alpha(theme.resolveVar('palette-background-level2'), 0.6),
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      variant="outlined"
    >
      <Tooltip title="Add to shop">
        <IconButton
          size="lg"
          color="success"
          variant="plain"
          sx={{ p: 0.5, m: 0.5, borderRadius: 'lg' }}
          onClick={() => open({ item, backItem: false })}
        >
          <CartPlusIcon />
        </IconButton>
      </Tooltip>
    </Sheet>
  );
}

const ItemEntry = React.memo(function ItemEntry(
  item: ClothingItem
): JSX.Element {
  const [hovered, setHovered] = React.useState(false);
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
        position: 'relative',
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
          position: 'relative',
          overflow: 'hidden',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={getIconAssetPath(item.id)}
          alt={item.name}
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            objectFit: 'scale-down',
          }}
          loading="lazy"
        />
        <ItemEntryAddToShop item={item} hovered={hovered} />
      </Box>
      <Tooltip enterDelay={1000} title={item.name}>
        <Typography level="body-sm" textAlign="center" width="10dvh" noWrap>
          {item.name}
        </Typography>
      </Tooltip>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography level="body-xs" textAlign="center">
          (ID: {item.id})
        </Typography>
        <ItemEntryWarnings {...item} />
      </Stack>
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
                >
                  <Typography level="body-sm">Show added to shop</Typography>
                  <Checkbox
                    color="success"
                    variant="plain"
                    checked={filter.showAddedToShop}
                    onChange={(e) => {
                      e.stopPropagation();
                      setFilter((prev) => ({
                        ...prev,
                        showAddedToShop: e.target.checked,
                      }));
                    }}
                  />
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
                >
                  <Typography level="body-sm">Show probably broken</Typography>
                  <Checkbox
                    color="success"
                    variant="plain"
                    checked={filter.showProbablyBroken}
                    onChange={(e) => {
                      e.stopPropagation();
                      setFilter((prev) => ({
                        ...prev,
                        showProbablyBroken: e.target.checked,
                      }));
                    }}
                  />
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
  } = useTunnelEndpoint<any>('/dev/clothing' as any, jsonFetcher);

  const PAGE_SIZE = 25;
  const [page, setPage] = React.useState(1);
  const [filter, setFilter] = React.useState<Filter>({
    query: '',
    showAddedToShop: true,
    showProbablyBroken: true,
  });
  const filteredItems = React.useMemo(() => {
    if (!clothingItems) return [];
    console.log(clothingItems);

    const filtered = (clothingItems as ClothingItem[]).filter((item) => {
      if (filter.query.trim().length > 0) {
        if (!item.name.toLowerCase().includes(filter.query.toLowerCase()))
          return false;
        if (String(item.id).includes(filter.query)) return false;
      }
      if (!filter.showAddedToShop && item.in_shop) return false;
      if (!filter.showProbablyBroken) {
        const { icon, paper, sprites } = item.props;
        if (!icon || !paper || !sprites) return false;
      }
      return true;
    });
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
      <Box flexGrow={1} overflow="auto" pr={0.5}>
        <Box
          display="grid"
          width="100%"
          gridTemplateColumns={`repeat(auto-fill, minmax(14dvh, 1fr))`}
          gridAutoRows={`minmax(14dvh, 1fr)`}
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
      <AddClothingToShopModal />
    </Sheet>
  );
}

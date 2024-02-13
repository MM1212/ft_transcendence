import GenericPlaceholder from '@components/GenericPlaceholder';
import Pagination from '@components/Pagination';
import BugIcon from '@components/icons/BugIcon';
import { jsonFetcher } from '@hooks/tunnel';
import { Box, CircularProgress, Sheet, Typography } from '@mui/joy';
import React from 'react';
import useSWR from 'swr';

function ClothingItemEntries(): JSX.Element {
  const {
    data: clothingItems,
    error,
    isLoading,
  } = useSWR<{ id: number; name: string }[]>(
    '/assets/penguin/dev/clothing-items.json',
    jsonFetcher
  );

  const PAGE_SIZE = 25;
  const [page, setPage] = React.useState(1);
  const items = React.useMemo(
    () =>
      !clothingItems
        ? []
        : [...new Array(PAGE_SIZE)].map(
            (_, i) => clothingItems[i + (page - 1) * PAGE_SIZE]
          ).filter(Boolean),
    [clothingItems, page]
  );
  const handlePageChange = (_: any, value: number) => setPage(value);
  if (isLoading) {
    return <CircularProgress />;
  }
  if (!clothingItems || error) {
    return (
      <GenericPlaceholder
        icon={<BugIcon />}
        title="Error"
        label={error.message}
      />
    );
  }

  const getIconAssetPath = (id: number) =>
    `${
      import.meta.env.FRONTEND_PUBLIC_CDN_URL
    }/client/dist/assets/media/clothing/icon/${id}.webp`;

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      height="100%"
    >
      <Typography level="h4" textAlign="center">
        Clothing Items ({items.length})
      </Typography>
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
                  p: .25,
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
              <Typography
                level="body-sm"
                textAlign="center"
                width="10dvh"
                noWrap
              >
                {item.name}
              </Typography>
              <Typography level="body-xs" textAlign="center">
                (ID: {item.id})
              </Typography>
            </Sheet>
          ))}
        </Box>
      </Box>
      <Pagination
        count={Math.ceil(clothingItems.length / PAGE_SIZE)}
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

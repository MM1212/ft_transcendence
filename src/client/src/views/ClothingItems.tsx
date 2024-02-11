import GenericPlaceholder from '@components/GenericPlaceholder';
import BugIcon from '@components/icons/BugIcon';
import { jsonFetcher } from '@hooks/tunnel';
import { Box, CircularProgress, Sheet, Typography } from '@mui/joy';
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

  // const items = [...new Array(10)].map((_, i) => clothingItems[i]);
  const items = clothingItems;
  return (
    <Box
      display="flex"
      width="100%"
      flexWrap={'wrap'}
      maxHeight="100%"
      overflow="auto"
      justifyContent="flex-start"
      alignItems="flex-start"
      gap={1}
    >
      <Typography level="h4" textAlign="center">
        Clothing Items ({items.length})
      </Typography>
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
              flex: '0 0 15dvh',
              flexGrow: 1,
              maxWidth: '15dvh',
              minHeight: '15dvh',
            }}
          >
            <Box
              sx={{
                aspectRatio: '1 / 1',
                mx: 2,
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
                loading='lazy'
              />
            </Box>
            <Typography level="body-sm" textAlign="center">
              {item.name} (ID: {item.id})
            </Typography>
          </Sheet>
        ))}
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

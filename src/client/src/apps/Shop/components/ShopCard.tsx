import CurrencyTwdIcon from '@components/icons/CurrencyTwdIcon';
import { Box, Sheet, styled } from '@mui/joy';
import { Button, Card, CardContent, Typography } from '@mui/joy';
import ShopModel from '@typings/models/shop';
import { useShopActions } from '../hooks/useShopActions';

const StyledImg = styled('img')(() => ({}));

export default function ShopCard({
  id,
  canBuy,
  price,
  label,
  description,
  listingMeta,
  owned,
}: ShopModel.Models.Item & {
  canBuy: boolean;
  owned: boolean;
}) {
  const { buyItem, loading } = useShopActions();

  return (
    <Card sx={{ width: '20dvh' }}>
      <Typography level="title-lg">{label}</Typography>
      <Sheet
        variant="soft"
        sx={{
          p: 1,
          borderRadius: 'sm',
          aspectRatio: 2 / 1.1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <StyledImg
          src={listingMeta.previewUrl}
          loading="lazy"
          style={{ objectFit: 'scale-down', width: '10dvh', height: '10dvh' }}
          sx={listingMeta.css}
        />
      </Sheet>
      <Typography level="body-xs">{description}</Typography>

      <CardContent orientation="horizontal">
        <div>
          <Typography level="body-xs">Price:</Typography>
          <Box display="flex" alignItems="center" gap={0.25}>
            <CurrencyTwdIcon size="xs" />
            <Typography level="title-sm" component="span">
              {price}
            </Typography>
          </Box>
        </div>
        <Button
          onClick={!owned ? () => buyItem(id) : undefined}
          variant="outlined"
          color={owned ? 'warning' : 'success'}
          size="md"
          loading={loading}
          disabled={!owned && !canBuy}
          sx={{ ml: 'auto', alignSelf: 'center' }}
        >
          {owned ? 'Owned' : 'Buy'}
        </Button>
      </CardContent>
    </Card>
  );
}

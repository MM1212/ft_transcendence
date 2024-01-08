import {
  InventoryCategory, inventoryAtom
} from "@apps/Customization/state";
import { useConfirmationModalActions } from "@apps/Modals/Confirmation/hooks";
import CurrencyTwdIcon from "@components/icons/CurrencyTwdIcon";
import ShoppingIcon from "@components/icons/ShoppingIcon";
import { Sheet } from "@mui/joy";
import { AspectRatio, Button, Card, CardContent, Typography } from "@mui/joy";
import { randomInt } from "@utils/random";
import { useRecoilCallback } from "recoil";

export default function ShopCard({
  category,
  imageUrl,
  itemId,
  canBuy,
}: {
  category: InventoryCategory;
  itemId: number;
  imageUrl?: string;
  canBuy: boolean;
}) {
  const value = randomInt(100, 2000).toString();
  const { confirm } = useConfirmationModalActions();
  const buyItem = useRecoilCallback(ctx => async () => {
    const confirmed = await confirm({
      content: `
        Are you sure you want to buy this item?
    `,
      confirmText: 'Purchase',
      confirmColor: 'success',
      headerIcon: ShoppingIcon
    });
    if (!confirmed) return;
    ctx.set(inventoryAtom, prev =>  {
      const inv = {...prev};
      inv.notBought = {
        ...inv.notBought,
        [category]: inv.notBought[category].filter(id => id !== itemId)
      }
      inv.bought = {
        ...inv.bought,
        [category]: [...inv.bought[category], itemId]
      }
      return inv;
    })

  }, [category, itemId, confirm]);
  return (
    <Card sx={{ width: '20dvh' }}>
      <Sheet variant="soft" sx={{p: 1}}>
      <AspectRatio ratio={2/1.1} variant="plain">
        <img
          src={imageUrl}
          srcSet="https://images.unsplash.com/photo-1527549993586-dff825b37782?auto=format&fit=crop&w=286&dpr=2 2x"
          loading="lazy"
          style={{ objectFit: "scale-down" }}
        />
      </AspectRatio>
      </Sheet>
      <CardContent orientation="horizontal">
        <div>
          <Typography level="body-xs">Price:</Typography>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography fontSize="sm">{value}</Typography>
            <CurrencyTwdIcon size="xs" />
          </div>
        </div>
        <Button
          onClick={buyItem}
          variant="outlined"
          color='success'
          size="md"
          disabled={!canBuy}
          sx={{ ml: "auto", alignSelf: "center" }}
        >
          Buy
        </Button>
      </CardContent>
    </Card>
  );
}
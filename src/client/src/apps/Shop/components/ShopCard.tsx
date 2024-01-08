import {
  InventoryCategory, inventoryAtom
} from "@apps/Customization/state";
import { useConfirmationModalActions } from "@apps/Modals/Confirmation/hooks";
import CurrencyTwdIcon from "@components/icons/CurrencyTwdIcon";
import ShoppingIcon from "@components/icons/ShoppingIcon";
import { useCurrentUser, useSession, useUser } from "@hooks/user";
import { AspectRatio, Button, Card, CardContent, Typography } from "@mui/joy";
import { randomInt } from "@utils/random";
import { useRecoilCallback } from "recoil";

export default function ShopCard({
  category,
  imageUrl,
  itemId
}: {
  category: InventoryCategory;
  itemId: number;
  imageUrl?: string;
}) {
  const value = randomInt(100, 2000).toString();
  const user = useCurrentUser();
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

  }, [category, itemId, confirm, user]);
  return (
    <Card sx={{ width: 250 }}>
      <AspectRatio minHeight="120px" maxHeight="200px">
        <img
          src={imageUrl}
          srcSet="https://images.unsplash.com/photo-1527549993586-dff825b37782?auto=format&fit=crop&w=286&dpr=2 2x"
          loading="lazy"
          style={{ objectFit: "scale-down" }}
        />
      </AspectRatio>
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
          color='warning'
          size="md"
          aria-label="Explore Bahamas Islands"
          sx={{ ml: "auto", alignSelf: "center", fontWeight: 600 }}
        >
          Buy
        </Button>
      </CardContent>
    </Card>
  );
}
//     <Card
//       variant="outlined"
//       sx={{
//         p: 1,
//         height: 200,
//         width: 100,
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         cursor: !disabled ? 'pointer' : undefined,
//         bgcolor:
//           selected && !disabled && !loading ? 'background.level2' : undefined,
//         borderRadius: (theme) => theme.radius.sm,
//         transition: (theme) => theme.transitions.create('background-color'),
//         '&:hover':
//           !disabled && !loading
//             ? {
//                 bgcolor: 'background.level1',
//               }
//             : undefined,
//         flex,
//         overflow: 'hidden',
//         ...imgProps,
//       }}
//       onClick={!disabled && !loading ? onClick : undefined}
//     >
//       {loading ? (
//         <CircularProgress variant="plain" />
//       ) : imageUrl ? (
//         <img
//           src={imageUrl}
//           style={{
//             width: '100%',
//             height: '100%',
//             objectFit: 'scale-down',
//           }}
//         />
//       ) : (
//         children
//       )}
//       <Typography>Name of Element</Typography>
//       <Typography>89</Typography>
//     </Card>
//   );
// }

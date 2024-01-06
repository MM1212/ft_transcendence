import {
  InventoryCategory
} from "@apps/Customization/state";
import CurrencyTwdIcon from "@components/icons/CurrencyTwdIcon";
import { AspectRatio, Button, Card, CardContent, Typography } from "@mui/joy";
import { SxProps } from "@mui/joy/styles/types";
import { randomInt } from "@utils/random";
import React from "react";

export default function ShopCard({
  flex = 1,
  category,
  onClick,
  imageUrl,
  selected,
  children,
  disabled = false,
  imgProps,
  loading = false,
}: {
  disabled?: boolean;
  category: InventoryCategory;
  imageUrl?: string;
  selected?: boolean;
  flex?: React.CSSProperties["flex"];
  onClick?: () => void;
  children?: React.ReactNode;
  imgProps?: SxProps;
  loading?: boolean;
}) {
  const value = randomInt(100, 2000).toString();
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
          variant="solid"
          size="md"
          color="primary"
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

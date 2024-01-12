import { InventoryCategory, inventoryNotBoughtCategoryItems, getClothIcon } from "@apps/Customization/state";
import { Box } from "@mui/joy";
import { useRecoilValue } from "recoil";
import ShopCard from "./ShopCard";

export default function ShopCustomizationItems({
    category,
    credits
  }: {
    category: InventoryCategory;
    credits: number
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
          <Box key={clothId} sx={{ height: "fit-content" }}>
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
  
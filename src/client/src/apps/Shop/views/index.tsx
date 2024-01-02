import { Sheet } from "@mui/joy";
import ShopTabs from "../components/ShopTabs";

export default function ShopView() {
  return (
    <Sheet
      sx={{
        width: "80dvh",
        height: "100%",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      <ShopTabs></ShopTabs>
    </Sheet>
  );
}

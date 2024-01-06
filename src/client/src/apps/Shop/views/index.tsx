import { Sheet, Typography } from "@mui/joy";
import ShopTabs from "../components/ShopTabs";

export default function ShopView() {
  return (
    <Sheet
      sx={{
        width: "106vh",
        height: "93vh",
        borderLeft: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <ShopTabs></ShopTabs>
    </Sheet>
  );
}

import { Divider } from "@mui/joy";
import { Stack } from "@mui/joy";
import { Sheet } from "@mui/joy";
import CustomizationTop from "./Customization/CustomizationTop";
import CustomizationBottom from "./Customization/CustomizationBottom";

export default function CustomizationPanel() {
  return (
    <Sheet
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CustomizationTop />
      <Divider orientation="horizontal" />
      <CustomizationBottom />
    </Sheet>
  );
}

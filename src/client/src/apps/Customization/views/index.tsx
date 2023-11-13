import { Divider } from "@mui/joy";
import { Sheet } from "@mui/joy";
import CustomizationTop from "../components/CustomizationTop";
import CustomizationBottom from "../components/CustomizationBottom";

export default function CustomizationPanel() {
  return (
    <Sheet
      sx={{
        width: "100dvh",
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

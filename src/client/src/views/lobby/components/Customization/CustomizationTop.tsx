import { Divider } from "@mui/joy";
import { Stack } from "@mui/joy";
import { Sheet } from "@mui/joy";
import CustomizationBox from "./CustomizationBox";

export default function CustomizationTop() {
  return (
    <Sheet sx={{ width: "100%", display: "flex", height: "70%" }}>
      <Stack
        sx={{ display: "flex", justifyContent: "space-evenly", width: "25%" }}
      >
        <CustomizationBox />
        <CustomizationBox />
        <CustomizationBox />
      </Stack>
      <Divider orientation="vertical" />
      <Stack sx={{ width: "50%" }}></Stack>
      <Divider orientation="vertical" />
      <Stack
        sx={{ display: "flex", justifyContent: "space-evenly", width: "25%" }}
      >
        <CustomizationBox />
        <CustomizationBox />
        <CustomizationBox />
      </Stack>
    </Sheet>
  );
}

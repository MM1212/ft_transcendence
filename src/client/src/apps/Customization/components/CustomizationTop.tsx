import { Divider } from "@mui/joy";
import { Stack } from "@mui/joy";
import { Sheet } from "@mui/joy";
import CustomizationBox from "./CustomizationBox";
import CustomeBeard from "../assets/CustomeBeard.png";
import CustomeBoots from "../assets/CustomeBoots.png";
import CustomeHead from "../assets/CustomeHead.png";
import CustomeTop from "../assets/CustomeTop.png";
import CustomeBottom from "../assets/CustomeBottom.png";
import CustomeNeck from "../assets/CustomeNeck.png";

export default function CustomizationTop() {
  const mySetupLeft: string[] = [CustomeTop, CustomeBottom, CustomeNeck];
  const mySetupRight: string[] = [CustomeHead, CustomeBeard, CustomeBoots];
  return (
    <Sheet sx={{ width: "100%", display: "flex", height: "70%" }}>
      <Stack
        sx={{ display: "flex", justifyContent: "space-evenly", width: "25%" }}
      >
        {mySetupRight.map((image, index) => (
          <CustomizationBox key={index} clicable={false} imageUrl={image} />
        ))}
      </Stack>
      <Divider orientation="vertical" />
      <Stack sx={{ width: "50%" }}></Stack>
      <Divider orientation="vertical" />
      <Stack
        sx={{ display: "flex", justifyContent: "space-evenly", width: "25%" }}
      >
        {mySetupLeft.map((image, index) => (
          <CustomizationBox key={index} clicable={false} imageUrl={image} />
        ))}
      </Stack>
    </Sheet>
  );
}

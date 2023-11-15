import { Sheet, Stack } from "@mui/joy";
import AchievementHead from "../components/AchievementHead";
import AchievementLogo from "../components/AchievementLogo";

export default function AchievementsPanel() {
  return (
    <Sheet sx={{ width: "80dvh", height: "100%" }}>
      <AchievementHead />
      <Stack
        direction="column"
        sx={{
          width: "100%",
          height: "80%",
        }}
        overflow="auto"
      >
        <AchievementLogo />
      </Stack>
    </Sheet>
  );
}

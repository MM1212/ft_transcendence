import { Sheet, Stack } from "@mui/joy";
import AchievementHead from "./Achievements/AchievementHead";
import AchievementLogo from "./Achievements/AchievementLogo";
import { Divider } from "@mui/joy";

export default function AchievementsPanel() {
  return (
    <Sheet sx={{ width: "50%", height: "100%" }}>
      <AchievementHead />
      <Stack
        direction="column"
        sx={{
          width: "100%",
          height: "75%",
        }}
        overflow="auto"
      >
        <AchievementLogo />
      </Stack>
    </Sheet>
  );
}

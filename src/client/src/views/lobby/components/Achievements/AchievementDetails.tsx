import { Stack } from "@mui/joy";
import { Box, Typography } from "@mui/joy";
import { backGroundImg } from "@views/lobby/hardoceTestes";

export default function AchievementDetails() {
  return (
    <Stack >
      <Box
        sx={{
          width: "100%",
          img: {
            height: "100%",
            width: "100%",
          },
        }}
      >
        <Typography level="body-lg">
          You are the pinacle of existence
        </Typography>
        <img src={backGroundImg} alt="Background"></img>
        <Typography level="body-md" sx={{ zIndex: "1", position: "absolute" }}>
          You have completed several games that gave you this incredible
          achievement
        </Typography>
      </Box>
    </Stack>
  );
}

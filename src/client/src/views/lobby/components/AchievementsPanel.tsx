import { Avatar, Sheet, Stack, Typography } from "@mui/joy";
import AchievementHead from "./Achievements/AchievementHead";
import { Box } from "@mui/joy";
import StackExchangeIcon from "@components/icons/StackExchangeIcon";

const myAchievements: string[] = [
  "https://cdn-icons-png.flaticon.com/512/4047/4047954.png",
  "https://cdn-icons-png.flaticon.com/512/8744/8744961.png",
  "https://cdn-icons-png.flaticon.com/512/8683/8683795.png",
  "https://cdn-icons-png.flaticon.com/512/8744/8744961.png",
  "https://cdn-icons-png.flaticon.com/512/4047/4047954.png",
  "https://cdn-icons-png.flaticon.com/512/8744/8744961.png",
  "https://cdn-icons-png.flaticon.com/512/8744/8744961.png",
  "https://cdn-icons-png.flaticon.com/512/8744/8744961.png",
];

const backGroundImg =
  "https://png.pngtree.com/thumb_back/fh260/background/20200731/pngtree-blue-carbon-background-with-sport-style-and-golden-light-image_371487.jpg";

export default function AchievementsPanel() {
  return (
    <Sheet sx={{ width: "70%", height: "100%" }}>
      <AchievementHead />
      <Stack
        direction="column"
        spacing={1}
        sx={{
          width: "100%",
          height: "100%",
        }}
        overflow="auto"
      >
        {myAchievements.map((achievement, index) => {
          return (
            <Stack
              sx={{
                width: "100%",
                //   height: "20%",
                //   img: {
                //     height: "100%",
                //     width: "30%",
                //   },
              }}
              key={index}
              direction="row"
              spacing={2}
            >
              <img src={achievement} alt={`Achievement ${index}`} />
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
                <Typography
                  level="body-md"
                  sx={{ zIndex: "1", position: "absolute" }}
                >
                  You have completed several games that gave you this incredible
                  achievement
                </Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Sheet>
  );
}

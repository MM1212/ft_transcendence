import { Box, Card, CardContent, CardCover, Stack, Typography } from "@mui/joy";
import IetiBadgeAchievment from "../assets/IetiBadgeAchievment.jpg";
import OctopBadgeAchievement from "../assets/OctopBadgeAchievement.jpg";
import RedBadge from "../assets/RedBadge.jpg";
import { Avatar } from "@mui/joy";

export const backGroundImg =
  "https://png.pngtree.com/thumb_back/fh260/background/20200714/pngtree-modern-double-color-futuristic-neon-background-image_351866.jpg";
export default function AchievementLogo() {
  const myAchievements: string[] = [
    IetiBadgeAchievment,
    OctopBadgeAchievement,
    RedBadge,
    IetiBadgeAchievment,
    OctopBadgeAchievement,
    RedBadge,
  ];

  return (
    <>
      <Stack p={1} spacing={1}>
        {myAchievements.map((achievement, index) => (
          <Card sx={{ flexDirection: "row" }} key={index}>
            <CardContent
              sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "row",
                pr: 15,
              }}
            >
              <Avatar
                sx={(theme) => ({
                  width: theme.spacing(20),
                  height: theme.spacing(20),
                  borderRadius: 0,
                })}
                src={achievement}
                alt={`Achievement ${index}`}
              />
              <Stack spacing={2}>
                <Typography level="body-md" fontWeight="lg" textColor="#fff">
                  You have Achieve Greatness
                </Typography>
                <Typography level="body-xs" textColor="#eec">
                  In the crucible of combat, you have emerged as an indomitable
                  force, triumphing over a relentless horde of 100 adversaries
                  without a single defeat. Your unyielding spirit and unwavering
                  resolve mark you as a true champion. The path to glory lies
                  open before you forge onward, noble warrior, for victory is
                  your birthright!
                </Typography>
              </Stack>
            </CardContent>
            <CardCover>
              <img src={backGroundImg} />
            </CardCover>
          </Card>
        ))}
      </Stack>
    </>
  );
}

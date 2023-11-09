import { Card, CardContent, CardCover, Stack, Typography } from "@mui/joy";
import { backGroundImg } from "@views/lobby/hardoceTestes";
import IetiBadgeAchievment from "@views/lobby/components/Achievements/assets/IetiBadgeAchievment.jpg";
import OctopBadgeAchievement from "@views/lobby/components/Achievements/assets/OctopBadgeAchievement.jpg";
import RedBadge from "@views/lobby/components/Achievements/assets/RedBadge.jpg";

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
      {myAchievements.map((achievement, index) => (
        <Stack
          sx={{
            width: "100%",
            img: {
              width: "30%",
            },
            paddingBottom: "10px",
            marginTop: "10px",
          }}
          key={index}
          direction="row"
          spacing={1}
        >
          <img src={achievement} alt={`Achievement ${index}`} />
          <Card component="li" sx={{ minWidth: 300, flexGrow: 1 }}>
            <CardContent>
              <Typography
                level="body-md"
                fontWeight="lg"
                textColor="#fff"
                mt={{ xs: 1, sm: -2 }}
              >
                You have Achieve Greatness
              </Typography>
              <Typography
                level="body-xs"
                textColor="#eec"
                mt={{ xs: 1, sm: 3 }}
                sx={{
                  paddingLeft: "60px",
                  paddingRight: "45px",
                  paddingTop: "40px",
                }}
              >
                In the crucible of combat, you've emerged as an indomitable
                force, triumphing over a relentless horde of 100 adversaries
                without a single defeat. Your unyielding spirit and unwavering
                resolve mark you as a true champion. The path to glory lies open
                before you forge onward, noble warrior, for victory is your
                birthright!
              </Typography>
            </CardContent>
            <CardCover>
              <img src={backGroundImg} />
            </CardCover>
          </Card>
        </Stack>
      ))}
    </>
  );
}

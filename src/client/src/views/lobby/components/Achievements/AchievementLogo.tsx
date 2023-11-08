import { Card, CardContent, CardCover, Stack, Typography } from "@mui/joy";
import { backGroundImg, myAchievements } from "@views/lobby/hardoceTestes";

export default function AchievementLogo() {
  const testImg =
    "https://avatars.githubusercontent.com/u/63326242?s=400&u=376c4486d63d0bb1cecac84ea231fd3d449a7246&v=4";
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
          <img src={testImg} alt={`Achievement ${index}`} />
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

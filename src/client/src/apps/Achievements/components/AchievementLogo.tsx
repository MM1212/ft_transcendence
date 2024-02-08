import { Card, CardContent, CardCover, Stack, Typography } from "@mui/joy";
import { Avatar } from "@mui/joy";
import GenericPlaceholder from "@components/GenericPlaceholder";
import TrophyBrokenIcon from "@components/icons/TrophyBrokenIcon";
import publicPath from "@utils/public";

export const backGroundImg =
  "https://png.pngtree.com/thumb_back/fh260/background/20200714/pngtree-modern-double-color-futuristic-neon-background-image_351866.jpg";
export default function AchievementLogo({
  myAchievements,
  myAchivTitle,
  myAchivDescription,
}: {
  myAchievements: string[];
  myAchivTitle: string[];
  myAchivDescription: string[];
}) {
  return (
    <>
      <Stack p={1} spacing={5} height={"100%"}>
        {myAchievements.length > 0 ? (
          <>
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
                      width: theme.spacing(12),
                      height: theme.spacing(12),
                      borderRadius: 0,
                    })}
                    src={achievement}
                    alt={`Achievement ${index}`}
                  />
                  <Stack spacing={2}>
                    <Typography
                      level="body-md"
                      fontWeight="lg"
                      textColor="#fff"
                    >
                      {myAchivTitle[index]}
                    </Typography>
                    <Typography level="body-xs" textColor="#eec">
                      {myAchivDescription[index]}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardCover>
                  <img
                    src={publicPath("/loginPage.webp")}
                    alt="background"
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "blur(4px)",
                      opacity: 0.4,
                    }}
                  />
                </CardCover>
              </Card>
            ))}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <GenericPlaceholder
              title="No Achievements Earn"
              icon={<TrophyBrokenIcon fontSize="xl4" />}
              path=""
            />
          </div>
        )}
      </Stack>
    </>
  );
}

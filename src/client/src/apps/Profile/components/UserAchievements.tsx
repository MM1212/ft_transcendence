import { Stack, Tooltip } from "@mui/joy";
import ProfileTabHeader from "./ProfileTabHeader";
import IetiBadgeAchievment from "../../Achievements/assets/IetiBadgeAchievment.jpg";
import OctopBadgeAchievement from "../../Achievements/assets/OctopBadgeAchievement.jpg";
import RedBadge from "../../Achievements/assets/RedBadge.jpg";
import { Avatar } from "@mui/joy";

export default function UserAchievements({ id }: { id?: number }) {
  const myAchievements: string[] = [
    IetiBadgeAchievment,
    OctopBadgeAchievement,
    RedBadge,
    OctopBadgeAchievement,
  ];
  const achievementsName: string[] = [
    "IetiBadge",
    "OctopBadge",
    "RedBadge",
    "OctopBadge",
  ]

  const sizeBadge = (array: string[]) => {
    if (array.length < 6)
      return "xl";
    if (array.length > 10)
      return "md";
    return "lg"
  }



  return (
    <Stack p={1} width="100%" alignItems="center" height='50%'>
      <ProfileTabHeader
        title="Achievements"
        path={`/achievements/${id ?? "me"}`}
      />
      <div
        style={{
          display: "flex",
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: "space-around",
          alignContent: "space-around",
          height: "10dvh",
          width: "100%",
        }}
      >
        {myAchievements.map((achievement, index) => (
          <>
            <Tooltip title={achievementsName[index]} size="sm">
              <Avatar size={sizeBadge(myAchievements)} src={achievement} alt={`Achievement ${index}`} />
            </Tooltip>
          </>
        ))}
      </div>
    </Stack>
  );
}

{
  /* <Grid
  container
  spacing={1}
  sx={{ width: '100%', flexGrow: 1 }}
  justifyContent="center"
>
  <Grid xs="auto">
    <Chip startDecorator="☀️" color="neutral">
      Spent an entire day in-game
    </Chip>
  </Grid>
  <Grid xs="auto">
    <Chip startDecorator="🏖️" color="neutral">
      Spent 4 hours in the lobby without entering a game
    </Chip>
  </Grid>
  <Grid xs="auto">
    <Chip startDecorator="🫠" color="neutral">
      16 games losing-streak
    </Chip>
  </Grid>
  <Grid xs="auto">
    <Chip startDecorator="🔥" color="neutral">
      8 game winning-streak
    </Chip>
  </Grid>
  <Grid>
    <Chip startDecorator="🫂" color="neutral">
      Spectate your friends losing 20 times
    </Chip>
  </Grid>
  <Grid>
    <Chip startDecorator="🧑‍🤝‍🧑" color="neutral">
      Spectate 5 games in a row
    </Chip>
  </Grid>
</Grid> */
}

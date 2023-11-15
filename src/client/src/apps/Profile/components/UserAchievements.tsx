import {Chip, Grid, Stack, Typography } from '@mui/joy';

export default function UserAchievements() {
  return (
    <>
      <Stack p={1} width="100%" alignItems="center">
        <Typography level="h2">Achievements</Typography>
        <Grid
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
        </Grid>
      </Stack>
    </>
  );
}

import { Chip, Grid, Typography } from "@mui/joy";

export default function UserAchievements() {
    return (<>
        <Typography level="h2">
            Achievements
        </Typography>
        <Grid
            container
            spacing={1}
            // columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            sx={{ width: '80%', flexGrow: 1 }}
        >
            <Grid xs="auto">
                <Chip startDecorator="☀️">
                    Spent an entire day in-game
                </Chip>
            </Grid>
            <Grid xs="auto">
                <Chip startDecorator="🏖️">
                    Spent 4 hours in the lobby without entering a game
                </Chip>
            </Grid>
            <Grid xs="auto">
                <Chip startDecorator="🫠">
                    16 games losing-streak
                </Chip>
            </Grid>
            <Grid xs="auto">
                <Chip startDecorator="🔥">
                    8 game winning-streak
                </Chip>
            </Grid>
            <Grid>
                <Chip startDecorator="🫂">
                    Spectate your friends losing 20 times
                </Chip>
            </Grid>
            <Grid>
                <Chip startDecorator="🧑‍🤝‍🧑">
                    Spectate 5 games in a row
                </Chip>
            </Grid>
        </Grid>
    </>);
}
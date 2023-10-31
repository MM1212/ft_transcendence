import { Chip, Typography } from "@mui/joy";

export default function UserAchievements() {
    return (<>
        <Typography level="h2">
            Achievements
        </Typography>
        <Chip startDecorator="☀️">
            Spent an entire day in-game
        </Chip>
        <Chip startDecorator="🏖️">
            Spent 4 hours in the lobby without entering a game
        </Chip>
    </>);
}
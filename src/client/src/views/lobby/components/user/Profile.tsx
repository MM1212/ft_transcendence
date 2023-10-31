import { useSession } from "@hooks/user";
import { Avatar, Chip, Divider, Sheet, Stack, Typography } from "@mui/joy";
import UserAchievements from "./UserAchievements";
import UserMatchHistory from "./UserMatchHistory";


export default function Profile() {
    const { user } = useSession();
    return (<>
      <Sheet
        sx={{
          borderRight: "1px solid",
          borderColor: "divider",
          height: "calc(100dvh - var(--Header-height))",
          overflowY: "auto",
          backgroundColor: "background.level2",
          width: "60%",
        }}
      >
        <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        >
            <Avatar alt="Me" size="lg" src={user?.avatar}
            />
            <Divider />
            <UserAchievements />
            <Divider />
            <UserMatchHistory />
        </Stack>
      </Sheet>
    </>);
}
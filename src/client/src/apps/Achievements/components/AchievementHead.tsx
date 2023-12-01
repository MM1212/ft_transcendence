import { Box, IconButton, Sheet } from "@mui/joy";
import { Stack, Typography } from "@mui/joy";
import AchivementBar from "./AchievementBar";
import { useCurrentUser } from "@hooks/user";
import { UserAvatar } from "@components/AvatarWithStatus";

export default function AchievementHead() {
  const user = useCurrentUser();

  if (!user) return null;
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
      py={{ xs: 2, md: 2 }}
      px={{ xs: 1, md: 2 }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, md: 2 }}
        alignItems="top"
        sx={{ width: "100%" }}
      >
        <UserAvatar size="lg" src={user.avatar} />
        <Sheet
          sx={{
            width: "100%",
          }}
        >
          <Typography fontWeight="lg" fontSize="lg" component="h2" noWrap>
           Achievements
          </Typography>
          {user.nickname}
          <Typography level="body-sm">
            7 of 10 achievements completed
          </Typography>
          <Box flexDirection="row-reverse" display="flex">
            <Typography level="body-sm">(70%)</Typography>
          </Box>
          <AchivementBar />
        </Sheet>
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center">
        <IconButton size="sm" variant="plain" color="neutral"></IconButton>
      </Stack>
    </Stack>
  );
}

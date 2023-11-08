import { Box, IconButton, Sheet } from "@mui/joy";
import { Avatar, Stack, Typography } from "@mui/joy";
import UsersModel from "@typings/models/users";
import AchivementBar from "./AchievementBar";

const UserTest: UsersModel.Models.IUser = {
  id: 1,
  studentId: 104676,
  nickname: "Mgranate",
  avatar:
    "https://cdn.intra.42.fr/users/f4205b7a140dd61a72312e1a88b9f719/rafilipe.jpg",
  createdAt: 34 | 2,
  friends: [2, 3, 4, 5],
  chats: [1, 2, 3, 4],
};

export default function AchievementHead() {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.level1",
        height: "20%",
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
        <Avatar size="lg" src={UserTest.avatar} />
        <Sheet
          sx={{
            width: "100%",
            height: "30%",
            backgroundColor: "background.level1",
          }}
        >
          <Typography fontWeight="lg" fontSize="lg" component="h2" noWrap>
            This is my list of achievements
          </Typography>
          {UserTest.nickname}
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

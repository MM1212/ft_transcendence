import { Box, IconButton, Sheet } from '@mui/joy';
import { Stack, Typography } from '@mui/joy';
import AchivementBar from './AchievementBar';
import { UserAvatar } from '@components/AvatarWithStatus';
import UsersModel from '@typings/models/users/index';

export default function AchievementHead({
  user,
  acquired,
  total,
}: {
  user: UsersModel.Models.IUserInfo;
  acquired: number;
  total: number;
}) {
  console.log(user);

  const percentage = (acquired / total) * 100;

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
      py={{ xs: 2, md: 2 }}
      px={{ xs: 1, md: 2 }}
    >
      <Stack
        direction="row"
        spacing={{ xs: 1, md: 2 }}
        alignItems="top"
        sx={{ width: '100%' }}
      >
        <UserAvatar size="lg" src={user.avatar} />
        <Sheet
          sx={{
            width: '100%',
          }}
        >
          <Typography fontWeight="lg" fontSize="lg" component="h2" noWrap>
            Achievements
          </Typography>
          {user.nickname}
          <Typography level="body-sm">
            {acquired} of 12 achievements completed
          </Typography>
          <Box flexDirection="row-reverse" display="flex">
            <Typography level="body-sm">({percentage.toFixed(2)}%)</Typography>
          </Box>
          <AchivementBar percentage={percentage} />
        </Sheet>
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center">
        <IconButton size="sm" variant="plain" color="neutral"></IconButton>
      </Stack>
    </Stack>
  );
}

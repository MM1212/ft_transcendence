import { Box, Sheet, Checkbox, Avatar, Skeleton } from '@mui/joy';
import { Stack, Typography } from '@mui/joy';
import AchivementBar from './AchievementBar';
import { UserAvatar } from '@components/AvatarWithStatus';
import UsersModel from '@typings/models/users/index';

export function AchievementHeadSkeleton(): JSX.Element {
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
        flexGrow={1}
        alignItems="top"
      >
        <Avatar size="lg">
          <Skeleton variant="circular" />
        </Avatar>
        <Sheet
          sx={{
            width: '100%',
          }}
        >
          <Typography fontWeight="lg" fontSize="lg" component="h2" noWrap>
            Achievements
          </Typography>
          <Skeleton variant="text" level="body-sm" width="20%" />
          <Skeleton variant="text" level="body-xs" width="35%" />
          <Box flexDirection="row-reverse" display="flex">
            <Skeleton level="body-sm" variant="text" width="5%" />
          </Box>
          <Skeleton variant="rectangular">
            <AchivementBar percentage={0} />
          </Skeleton>
        </Sheet>
        <Checkbox
          disabled
          variant="soft"
          size="sm"
          label="Show All"
          sx={{
            display: { xs: 'none', md: 'flex' },
            whiteSpace: 'nowrap',
          }}
        />
      </Stack>
    </Stack>
  );
}

export default function AchievementHead({
  user,
  acquired,
  total,
  checked,
  changer,
}: {
  user: UsersModel.Models.IUserInfo;
  acquired: number;
  total: number;
  checked: any;
  changer: any;
}) {
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
        flexGrow={1}
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
            {acquired} of {total} achievements completed
          </Typography>
          <Box flexDirection="row-reverse" display="flex">
            <Typography level="body-sm">({percentage.toFixed(2)}%)</Typography>
          </Box>
          <AchivementBar percentage={percentage} />
        </Sheet>
        <Checkbox
          variant="soft"
          size="sm"
          label="Show All"
          checked={checked}
          onChange={changer}
          sx={{
            display: { xs: 'none', md: 'flex' },
            whiteSpace: 'nowrap',
          }}
        />
      </Stack>
    </Stack>
  );
}

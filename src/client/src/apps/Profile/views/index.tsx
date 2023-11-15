import { useCurrentUser } from '@hooks/user';
import {
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import UserAchievements from '../components/UserAchievements';
import UserMatchHistory from '../components/UserMatchHistory';
import AvatarWithStatus from '@components/AvatarWithStatus';
import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';

export default function ProfileView() {
  const user = useCurrentUser();
  return (
    <Sheet
      style={{
        height: '100%',
        width: '45dvh',
      }}
    >
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          width="100%"
          position="relative"
          p={1}
          spacing={0.5}
        >
          <AvatarWithStatus
            sx={(theme) => ({
              width: theme.spacing(17),
              height: theme.spacing(17),
            })}
            src={user?.avatar}
            status={user?.status}
            badgeProps={{
              size: 'lg',
            }}
          />
          <Typography level="h2">{user?.nickname}</Typography>
          <ButtonGroup size="sm" variant="outlined">
            <Button size="sm">Message</Button>
            <Button size="sm">Friend Request</Button>
            <IconButton>
              <DotsVerticalIcon />
            </IconButton>
          </ButtonGroup>
        </Stack>
        <Divider />
        <UserAchievements />
        <Divider />
        <UserMatchHistory />
      </Stack>
    </Sheet>
  );
}

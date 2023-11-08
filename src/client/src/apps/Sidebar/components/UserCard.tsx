import Logo from '@components/Logo';
import CircleIcon from '@components/icons/CircleIcon';
import LogoutIcon from '@components/icons/LogoutIcon';
import { useCurrentUser, useSessionActions } from '@hooks/user';
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
} from '@mui/joy';
import { userStatusToColor, userStatusToString } from '@utils/userStatus';

function UserCardSkeleton(): JSX.Element {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Avatar>
        <Skeleton variant="circular" />
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Skeleton variant="text" level="title-sm" />
        <Skeleton variant="text" level="body-xs" />
      </Box>
      <IconButton size="sm" variant="plain" color="neutral" disabled>
        <LogoutIcon />
      </IconButton>
    </Box>
  );
}

export default function SidebarUserCard(): JSX.Element {
  const user = useCurrentUser();
  const { logout } = useSessionActions();
  if (!user) return <UserCardSkeleton />;
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Logo />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography level="title-sm">{user.nickname}</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CircleIcon
            size="xxs"
            sx={{
              color: (theme) => theme.getCssVar(userStatusToColor(user.status)),
            }}
          />
          <Typography level="body-xs">
            {userStatusToString(user.status)}
          </Typography>
        </Stack>
      </Box>
      <Tooltip title="Logout">
        <IconButton size="sm" variant="plain" color="neutral" onClick={logout}>
          <LogoutIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

import CancelIcon from '@components/icons/CancelIcon';
import { useUser } from '@hooks/user';
import { Stack, Typography, IconButton, Avatar } from '@mui/joy';

export default function FriendBlockedDisplay({
  id,
}: {
  id: number;
}): JSX.Element | null {
  const user = useUser(id);
  if (!user) return null;
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={1.5}
      key={user.id}
      sx={{
        width: '100%',
        borderRadius: (theme) => theme.radius.sm,
        p: 1,
        transition: (theme) => theme.transitions.create('background-color', {}),
        '&:hover': {
          backgroundColor: 'background.level1',
          cursor: 'pointer',
        },
      }}
    >
      <Stack direction="row" spacing={1.5}>
        <Avatar src={user.avatar} size="lg" />
        <Stack>
          <Typography level="title-md">{user.nickname}</Typography>
          <Typography level="body-sm">Blocked</Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" ml="auto">
        <IconButton
          color="danger"
          variant="plain"
          sx={{ borderRadius: (theme) => theme.radius.xl }}
        >
          <CancelIcon size="sm" />
        </IconButton>
      </Stack>
    </Stack>
  );
}

import CheckIcon from '@components/icons/CheckIcon';
import CloseIcon from '@components/icons/CloseIcon';
import { IconButton, Sheet, Typography } from '@mui/joy';
import { Divider } from '@mui/joy';
import { Stack } from '@mui/joy';
import { samplePendingFriends } from '@apps/Lobby_Old/state/mockup';
import { UserAvatar } from '@components/AvatarWithStatus';

export default function PendingFriendsGetter() {
  const getPendingRequests = () => {
    return 'PENDING - ' + samplePendingFriends.length;
  };
  return (
    <Sheet
      sx={{
        overflowY: 'auto',
      }}
    >
      <Typography fontWeight={'light'} fontSize={11} p={1}>
        {getPendingRequests()}
      </Typography>
      <Divider />
      <Stack p={1} spacing={1.5} justifyContent={'flex-end'}>
        {samplePendingFriends.map((user) => (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1.5}
            key={user.id}
            sx={{
              width: '100%',
              // borderRadius: (theme) => theme.radius.sm,
              p: 1,
              // '&:hover': {
              //   backgroundColor: 'background.level1',
              //   cursor: 'pointer',
              //   transition: (theme) =>
              //     theme.transitions.create('background-color', {}),
              // },
            }}
          >
            <Stack direction="row" spacing={1.5}>
              <UserAvatar src={user.avatar} size="lg" />
              <Stack>
                <Typography level="title-md">{user.nickname}</Typography>
                <Typography fontWeight="light" level="body-sm">
                  Incoming Friend Request
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} alignItems={'center'} ml="auto">
              <IconButton
                color="success"
                variant="plain"
                sx={{
                  borderRadius: (theme) => theme.radius.xl,
                }}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                color="danger"
                sx={{
                  borderRadius: (theme) => theme.radius.xl,
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Sheet>
  );
}

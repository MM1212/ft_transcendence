import { UserAvatar } from '@components/AvatarWithStatus';
import { useCurrentUser } from '@hooks/user';
import { Box, Stack, Typography } from '@mui/joy';
import publicPath from '@utils/public';

export default function LobbyPlayerBanner() {
  const user = useCurrentUser();
  if (user === null) return;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '3dvh',
        position: 'relative',
      }}
    >
      <Stack position="absolute" mt={8} spacing={2}>
        <UserAvatar
          sx={(theme) => ({
            width: theme.spacing(17),
            height: theme.spacing(17),
            zIndex: 1,
          })}
          variant="outlined"
          src={user?.avatar}
        />
        <Typography textAlign="center">{user.nickname}</Typography>
      </Stack>
      <img
        src={publicPath('/matchMaking/matchMakingFrame.webp')}
        alt="Matchmaking Frame"
        style={{
          width: '30dvh',
        }}
      />
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          marginTop: 'auto',
          bottom: '15%',
        }}
      >
        <img
          src={publicPath('/matchMaking/paddleFrame.webp')}
          alt="Matchmaking Frame"
          width="200"
          height="50"
        ></img>
      </div>
    </div>
  );
}

import { UserAvatar } from '@components/AvatarWithStatus';
import PlusIcon from '@components/icons/PlusIcon';
import { useUser } from '@hooks/user';
import { Box, Stack } from '@mui/joy';
import { Typography } from '@mui/joy';
import PongLobbyMatchmakingBanner from './Banner';
import { ArrowSelector } from '@components/ArrowSelector/ArrowSelector';

export default function LobbyPlayerBanner({ id }: { id: number | undefined }) {
  const user = useUser(id!);

  // add here the player's special power value

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
      {id === undefined ? (
        <Box
          sx={{
            width: '37vh',
            height: '41dvh',
            marginTop: '7dvh',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <UserAvatar
            sx={(theme) => ({
              width: theme.spacing(17),
              height: theme.spacing(17),
              cursor: 'pointer',
              zIndex: 1,
              transition: theme.transitions.create('background-color'),
              border: '2px solid',
              borderColor: 'warning.outlinedBorder',
              bgcolor: 'background.surface',
              '&:hover': {
                bgcolor: 'background.level1',
              },
            })}
            color="neutral"
            variant="soft"
          >
            <PlusIcon
              // onClick={handleInvite}
              size="lg"
            />
          </UserAvatar>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
              height: '40dvh',
              width: '40vh',
              // clipPath: 'polygon(50% 90%, 76% 80%, 76% 0, 24% 0, 24% 80%)',
              // backgroundColor: 'background.surface',
            }}
          >
            <PongLobbyMatchmakingBanner
              sx={{
                position: 'absolute',
                zIndex: 0,
                mt: -0.5,
                color: 'warning.outlinedBorder',
                width: '45vh',
                height: '41dvh',
              }}
            />
            <PongLobbyMatchmakingBanner
              sx={{
                position: 'absolute',
                zIndex: 0,
                color: 'background.surface',
                width: '40vh',
                height: '40dvh',
              }}
            />
            <Box
              zIndex={1}
              display="flex"
              alignItems="center"
              flexDirection="column"
              justifyContent="space-between"
              height="100%"
              pt={3}
              pb={5}
            >
              <Stack spacing={1} width="100%" alignItems="center">
                <UserAvatar
                  sx={(theme) => ({
                    width: theme.spacing(15),
                    height: theme.spacing(15),
                    zIndex: 1,
                  })}
                  src={user?.avatar}
                />
                <Typography>{user?.nickname}</Typography>
              </Stack>
              <ArrowSelector selectType='special_power'/>
            </Box>
          </Box>
        </>
      )}
    </div>
  );
}

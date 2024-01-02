import { UserAvatar } from '@components/AvatarWithStatus';
import { useSession, useUser } from '@hooks/user';
import { AvatarGroup, Sheet, Stack, Typography } from '@mui/joy';
import { randomInt } from '@utils/random';

export default function SingleMatchHist() {
  const user  = useUser(randomInt(0, 7));
  return (
    <>
      <Sheet
        variant="plain"
        sx={{
          width: '100%',
          p: 2,
          borderRadius: (theme) => theme.radius.md,
          backgroundColor: 'unset',
        }}
      >
        <Stack
          direction={'row'}
          width={'100%'}
          justifyContent="space-between"
          alignItems={'center'}
          position="relative"
        >
          {Math.random() > 0.5 ? (
            <Typography
              level="h4"
              textTransform="uppercase"
              ml={0}
              textColor={'primary.200'}
            >
              Victory
            </Typography>
          ) : (
            <Typography
              level="h4"
              textTransform="uppercase"
              ml={0}
              textColor={'danger.400'}
            >
              Defeat
            </Typography>
          )}
          <Stack
            direction="row"
            justifyContent="center"
            spacing={2}
            alignItems="center"
            position="absolute"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <AvatarGroup
              sx={{
                '--Avatar-size': (theme) => theme.spacing(3),
                transform: 'scaleX(-1)',
              }}
            >
              <UserAvatar size="sm" src={user?.avatar} />
              <UserAvatar
                size="sm"
                src={'https://mui.com/static/images/avatar/1.jpg'}
              />
            </AvatarGroup>
            <Sheet sx={{backgroundColor:'unset'}}>
              <Typography level="h3">{randomInt(0, 10)} - {randomInt(0, 10)}</Typography>
            </Sheet>
            <AvatarGroup
              sx={{
                '--Avatar-size': (theme) => theme.spacing(3),
              }}
            >
              <UserAvatar size="sm" src={user?.avatar} />
              <UserAvatar size="sm" src={user?.avatar} />
            </AvatarGroup>
          </Stack>
          <Stack direction="column" spacing={0.2} alignItems="flex-end">
            <Typography level="body-xs">11/05/04</Typography>
            <Typography level="body-xs">00:23:21</Typography>
          </Stack>
        </Stack>
      </Sheet>
    </>
  );
}

import { UserAvatar } from '@components/AvatarWithStatus';
import Link from '@components/Link';
import Logo42Icon from '@components/customIcons/Logo42';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { useSession, useSessionActions } from '@hooks/user';
import notifications, { NotificationProps } from '@lib/notifications/hooks';
import {
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Typography,
} from '@mui/joy';
import { AuthModel } from '@typings/models';
import UsersModel from '@typings/models/users';
import React from 'react';

function LoggedInSquare({ user }: { user: UsersModel.Models.IUserInfo }) {
  const { logout } = useSessionActions();
  return (
    <>
      <List>
        <ListItem>
          <ListItemDecorator>
            <UserAvatar src={user.avatar} />
          </ListItemDecorator>
          <ListItemContent>
            <Typography level="title-sm">{user.nickname}</Typography>
            <Typography
              level="body-sm"
              noWrap
              component={Link}
              to={`https://profile.intra.42.fr/users/${user.nickname}`}
            >
              Check Intra&apos;s profile here
            </Typography>
          </ListItemContent>
        </ListItem>
        <ListItem
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <ButtonGroup>
            <Button onClick={logout}>
              <Typography level="body-sm">Logout</Typography>
            </Button>
            <Button component={Link} href="/sse">
              <Typography level="body-sm">Placeholder</Typography>
            </Button>
            <Button
              onClick={() => {
                const seed = Date.now() % 5;
                let fnName: keyof typeof notifications;
                switch (seed) {
                  case 0:
                    fnName = 'success';
                    break;
                  case 1:
                    fnName = 'warning';
                    break;
                  case 2:
                    fnName = 'error';
                    break;
                  case 3:
                    fnName = 'info';
                    break;
                  case 4:
                  default:
                    fnName = 'default';
                    break;
                }
                notifications[fnName]('Boas, tudo bem?', {
                  duration: -1,
                } as NotificationProps);
              }}
            >
              <Typography level="body-sm">Test Notification</Typography>
            </Button>
          </ButtonGroup>
        </ListItem>
      </List>
    </>
  );
}

export function LoginSquare() {
  const { user, loading, loggedIn } = useSession();
  const [forceLoading, setForceLoading] = React.useState(false);
  if (loggedIn) return <LoggedInSquare user={user} />;

  return (
    <>
      {loading ? (
        <Button loading />
      ) : (
        <Button
          component={Link}
          href={buildTunnelEndpoint(AuthModel.Endpoints.Targets.Login)}
          color="primary"
          variant="solid"
          size="lg"
          onClick={() => setForceLoading(true)}
          loading={forceLoading}
        >
          <Typography
            level="title-lg"
            component="div"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: (theme) => theme.spacing(1),
            }}
          >
            Login with <Logo42Icon size="md" />{' '}
          </Typography>
        </Button>
      )}
    </>
  );
}

import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import Button from '@mui/joy/Button';
import { useSession } from '@hooks/user';
import {
  Avatar,
  ButtonGroup,
  Container,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { AuthModel } from '@typings/api';
import Link from '@components/Link';

import SseTester from '@components/SseTester';
import { Route, Switch } from 'wouter';
// import Lobby from '@views/lobby';

function App() {
  const [count, setCount] = useState(0);

  const { user, loading, loggedIn, logout } = useSession();

  return (
    <Switch>
      <Route path="/">
        <Container
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
          }}
        >
          <Stack direction="row" spacing={3}>
            <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank" rel="noreferrer">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </Stack>
          <h1>Vite + React</h1>
          <Sheet
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: (theme) => theme.radius.xs,
            }}
          >
            <Button
              variant="soft"
              onClick={() => setCount((count) => count + 1)}
            >
              count is {count}
            </Button>
            <p>
              Edit <code>src/App.tsx</code> and save to test HMR
            </p>
            {loading ? (
              <Button loading />
            ) : !loggedIn ? (
              <Button
                component={Link}
                href={buildTunnelEndpoint(AuthModel.Endpoints.Targets.Login)}
                variant="soft"
              >
                Login
              </Button>
            ) : (
              <>
                <List size="lg">
                  <ListItem>
                    <ListItemDecorator>
                      <Avatar src={user.avatar} />
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
                      <Button>
                        <Typography level="body-sm">Placeholder</Typography>
                      </Button>
                    </ButtonGroup>
                  </ListItem>
                </List>
              </>
            )}
          </Sheet>
          <p className="read-the-docs">
            Click on the Vite and React logos to learn more
          </p>
        </Container>
      </Route>
      <Route path="/sse">
        <SseTester />
      </Route>
      {/* <Route path="/lobby">
        <Lobby />
      </Route> */}
    </Switch>
  );
}

export default App;

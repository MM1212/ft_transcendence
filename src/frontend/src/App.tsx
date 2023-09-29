import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import Button from '@mui/joy/Button';
import './App.css';
import { useSession } from '@hooks/user';
import {
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Typography,
} from '@mui/joy';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { Endpoints } from '@typings/api';
import Link from '@components/Link';
import { useSseEvent } from '@hooks/sse';
import { SSE } from '@typings/api/sse';
import tunnel from '@lib/tunnel';

function App() {
  const [count, setCount] = useState(0);

  const { user, loading, loggedIn, logout } = useSession();

  useSseEvent<SSE.Payloads.FacebookNewFriendRequest>(
    SSE.Events.FacebookNewFriendRequest,
    ({ data, source }) => {
      console.log(data, source);
    }
  );
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <Button variant="soft" onClick={() => setCount((count) => count + 1)}>
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
            href={buildTunnelEndpoint(Endpoints.AuthLogin)}
            variant="soft"
          >
            Login
          </Button>
        ) : (
          <List>
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
                  href={user.url}
                >
                  Check Intra&apos;s profile here
                </Typography>
              </ListItemContent>
            </ListItem>
            <ListItem>
              <ListItemButton onClick={logout}>
                <Typography level="body-sm">Logout</Typography>
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  tunnel.post(Endpoints.SseTest, {});
                }}
              >
                <Typography level="body-sm">Test SSE</Typography>
              </ListItemButton>
            </ListItem>
          </List>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;

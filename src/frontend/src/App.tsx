import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import Button from '@mui/joy/Button';
import './App.css';
import { useSession } from '@hooks/user';
import {
  Avatar,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Typography,
} from '@mui/joy';
import { buildTunnelEndpoint } from '@hooks/tunnel';
import { Endpoints } from '@typings/api';
import Link from '@components/Link';

function App() {
  const [count, setCount] = useState(0);

  const { user, loading, loggedIn, logout } = useSession();
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
          <ListItem endAction={<Button onClick={logout}>Logout</Button>}>
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
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;

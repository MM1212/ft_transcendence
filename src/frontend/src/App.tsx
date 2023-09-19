import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import Button from '@mui/joy/Button';
import './App.css';
import { useTunnelEndpoint } from '@hooks/tunnel';
import { Endpoints } from '@typings/api';

function App() {
  const [count, setCount] = useState(0);

  const { isLoading, data, error } = useTunnelEndpoint<{ message: string }>(
    Endpoints.Test
  );
  console.log(isLoading, data, error);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
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
        <p>
          {isLoading
            ? 'Loading...'
            : error || !data
            ? error
              ? error.message
              : 'No data'
            : data.status === 'error'
            ? data.errorMsg
            : JSON.stringify(data.data) ?? 'No data'}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;

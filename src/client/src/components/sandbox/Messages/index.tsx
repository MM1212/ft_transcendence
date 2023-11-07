import * as React from 'react';
import Box from '@mui/joy/Box';
import MyMessages from './components/MyMessages';

export default function MessagesSandbox() {
  return (
    <Box sx={{ display: 'flex', height: '100dvh' }}>
      <MyMessages />
    </Box>
  );
}

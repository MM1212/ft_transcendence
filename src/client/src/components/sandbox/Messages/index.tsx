import * as React from 'react';
import Box from '@mui/joy/Box';
import Header from './components/Header';
import MyMessages from './components/MyMessages';

export default function MessagesSandbox() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      <Header />
      <Box component="main" className="MainContent" sx={{ flex: 1 }}>
        <MyMessages />
      </Box>
    </Box>
  );
}

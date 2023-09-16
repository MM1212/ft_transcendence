import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import type { Test } from '@typings/test';
import '@fontsource/inter';
import AppProviders from './Providers.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <App />
  </AppProviders>
);

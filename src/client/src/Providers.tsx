import { CssBaseline, CssVarsProvider } from '@mui/joy';
import React from 'react';
import { RecoilRoot } from 'recoil';
import theme from './theme';
import { SWRConfig } from 'swr';
import { Router } from 'wouter';
import StateMounter from '@state/mounter';
import NotificationsProvider from '@lib/notifications/Provider';
import moment from 'moment';
import ErrorBoundary from '@components/ExceptionCatcher';
import CustomScrollBar from '@theme/scrollBar';
import { Pixi } from '@hooks/pixiRenderer';

moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: '1s',
    ss: '%ss',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1M',
    MM: '%dM',
    y: '1Y',
    yy: '%dY',
  },
});

Pixi.Assets.setPreferences({
  preferWorkers: true,
});

export default function AppProviders({
  children,
}: React.PropsWithChildren<{}>): JSX.Element {
  return (
    <RecoilRoot>
      {/* <DebugObserver /> */}
      <SWRConfig
        value={{
          fetcher: (resource, init) =>
            fetch(resource, init).then((res) => res.json()),
          onError: console.error,
          onErrorRetry: (error) => {
            // Never retry on 404.
            if (error.status === 404) return;
          },
        }}
      >
        <StateMounter />
        <CssVarsProvider theme={theme} defaultMode="system">
          <CssBaseline />
          <CustomScrollBar />
          <NotificationsProvider />
          <ErrorBoundary>{children}</ErrorBoundary>
        </CssVarsProvider>
      </SWRConfig>
    </RecoilRoot>
  );
}

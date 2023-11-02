import { CssBaseline, CssVarsProvider } from '@mui/joy';
import React from 'react';
import { RecoilRoot } from 'recoil';
import testTheme from './theme';
import { SWRConfig } from 'swr';
import { Router } from 'wouter';
import StateMounter from '@state/mounter';
import NotificationsProvider from '@lib/notifications/Provider';

export default function AppProviders({
  children,
}: React.PropsWithChildren<{}>): JSX.Element {
  return (
    <RecoilRoot>
      <Router>
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
          <CssVarsProvider
            theme={testTheme}
            defaultMode="system"
            defaultColorScheme="dark"
            disableNestedContext
          >
            <CssBaseline />
            <NotificationsProvider />
            {children}
          </CssVarsProvider>
        </SWRConfig>
      </Router>
    </RecoilRoot>
  );
}

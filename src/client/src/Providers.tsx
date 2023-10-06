import { CssBaseline, CssVarsProvider } from '@mui/joy';
import React from 'react';
import { RecoilRoot } from 'recoil';
import testTheme from './theme';
import { SWRConfig } from 'swr';
import { Router } from 'wouter';
import { SseMounter } from '@hooks/sse/Provider';

export default function AppProviders({
  children,
}: React.PropsWithChildren<{}>): JSX.Element {
  return (
    <RecoilRoot>
      <SseMounter />
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
          <CssVarsProvider
            theme={testTheme}
            defaultMode="system"
            defaultColorScheme="dark"
            disableNestedContext
          >
            <CssBaseline />
            {children}
          </CssVarsProvider>
        </SWRConfig>
      </Router>
    </RecoilRoot>
  );
}
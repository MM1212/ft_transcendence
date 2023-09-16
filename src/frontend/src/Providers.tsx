import { CssBaseline, CssVarsProvider } from '@mui/joy';
import React from 'react';
import { RecoilRoot } from 'recoil';
import testTheme from './theme';

export default function AppProviders({
  children,
}: React.PropsWithChildren<{}>): JSX.Element {
  return (
    <RecoilRoot>
      <CssVarsProvider
        theme={testTheme}
        defaultMode="system"
        defaultColorScheme="dark"
        disableNestedContext
      >
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </RecoilRoot>
  );
}

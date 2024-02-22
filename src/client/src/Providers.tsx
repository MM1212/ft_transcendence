import { CssBaseline, CssVarsProvider } from '@mui/joy';
import React from 'react';
import { RecoilRoot } from 'recoil';
import theme from './theme';
import { SWRConfig } from 'swr';
import StateMounter from '@state/mounter';
import NotificationsProvider from '@lib/notifications/Provider';
import moment from 'moment';
import CustomScrollBar from '@theme/scrollBar';
import { Pixi } from '@hooks/pixiRenderer';
import * as Sentry from '@sentry/react';
import ErrorPage from '@apps/Error/views/index';

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

Sentry.init({
  dsn: import.meta.env.FRONTEND_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    import.meta.env.FRONTEND_HOST,
    import.meta.env.BACKEND_HOST,
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
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
          <Sentry.ErrorBoundary fallback={(props) => <ErrorPage {...props} />}>
            {children}
          </Sentry.ErrorBoundary>
        </CssVarsProvider>
      </SWRConfig>
    </RecoilRoot>
  );
}

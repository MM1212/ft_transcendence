import SideBar from '@apps/Sidebar/views';
import LoginPage from '@apps/LoginPage/views';
import Lobby from '@apps/Lobby/views';
import { Route, Switch } from 'wouter';
import ErrorPage from '@views/error';
import AuthRoute from '@components/AuthRoute';
import UpdateUserModal from '@apps/Profile/components/UpdateUserModal';
import React, { memo } from 'react';
import ImagePreviewView from '@apps/ImagePreview/views';
import ConfirmationModalView from '@apps/Modals/Confirmation/views';
import ChatSelectModal from '@apps/Chat/modals/ChatSelectModal';
import TFALoginPage from '@apps/TFALoginPage/views';
import SseWarning from '@hooks/sse/Warning';
import ChatPasswordInputModalView from '@apps/Chat/modals/ChatPasswordInputModal';
import ShopView from '@apps/Shop/views';
import { PostGameModal } from '@apps/GamePong/modals/openPostGameModal';
import * as Sentry from "@sentry/react";



Sentry.init({
  dsn: "https://8c29a2b857285c27f4b484af4d2d5aff@o4506744918507520.ingest.sentry.io/4506762687479808",
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
  tracePropagationTargets: ["localhost:3000"],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

const MainRoute = memo(() => {
  return React.useMemo(
    () => (
      <>
        <Lobby />
        <SideBar />
      </>
    ),
    []
  );
});

function App() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        padding: 0,
      }}
    >
      <Switch>
        <Route path="/login">
          <LoginPage />
        </Route>
        <Route path="/error">
          <ErrorPage />
        </Route>
        <Route path="/tfa">
          <TFALoginPage />
        </Route>
        <AuthRoute redirect="/login">
          <MainRoute />
          <UpdateUserModal />
          <ImagePreviewView />
          <ConfirmationModalView />
          <ChatSelectModal />
          <ChatPasswordInputModalView />
          <ShopView />
          <SseWarning />
          <PostGameModal />
        </AuthRoute>
      </Switch>
    </div>
  );
}

export default App;

import SideBar from '@apps/Sidebar/views';
import LoginPage from '@apps/LoginPage/views';
import Lobby from '@apps/Lobby/views';
import { Route, Switch } from 'wouter';
import ErrorPage from '@views/error';
import AuthRoute from '@components/AuthRoute';
import UpdateUserModal from '@apps/Profile/components/UpdateUserModal';
import React, { memo } from 'react';

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
        <AuthRoute redirect="/login">
          <MainRoute />
        </AuthRoute>
      </Switch>
      <UpdateUserModal />
    </div>
  );
}

export default App;

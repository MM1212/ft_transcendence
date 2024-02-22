import SideBar from "@apps/Sidebar/views";
import LoginPage from "@apps/LoginPage/views";
import Lobby from "@apps/Lobby/views";
import { Route, Switch } from "wouter";
import ErrorPage from "@views/error";
import AuthRoute from "@components/AuthRoute";
import UpdateUserModal from "@apps/Profile/components/UpdateUserModal";
import React, { memo } from "react";
import ImagePreviewView from "@apps/ImagePreview/views";
import ConfirmationModalView from "@apps/Modals/Confirmation/views";
import ChatSelectModal from "@apps/Chat/modals/ChatSelectModal";
import TFALoginPage from "@apps/TFALoginPage/views";
import SseWarning from "@hooks/sse/Warning";
import ChatPasswordInputModalView from "@apps/Chat/modals/ChatPasswordInputModal";
import ShopView from "@apps/Shop/views";
import { PostGameModal } from "@apps/GamePong/modals/openPostGameModal";

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
        width: "100%",
        height: "100%",
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

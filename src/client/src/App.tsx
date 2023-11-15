import SideBar from "@apps/Sidebar/views";
import SidebarWithRouter from "@apps/Sidebar/views/WithRouter";
import SseTester from "@components/SseTester";
import MainRoute from "@views";
import Lobby from "@views/lobby";
import { useRouter, Route } from "wouter";
import Pong from "@views/pong";

function App() {
  const router = useRouter();
  return (
    <div
      style={{
        width: "100dvw",
        height: "100dvh",
        margin: 0,
        padding: 0,
      }}
    >
      <SidebarWithRouter base="/sse" parent={router}>
        <SseTester />
      </SidebarWithRouter>
      <SidebarWithRouter base="/lobby" parent={router}>
        <Lobby />
      </SidebarWithRouter>
      <Route path="/">
        <MainRoute />
        <SideBar />
      </Route>
      <Route path="/pong">
        <Pong />
      </Route>
      {/* <Route path="/error">
          <ErrorPage />
        </Route>
      <Route>
          <Redirect to="/error?t=404" />
        </Route> */}
      {/* <SandboxRouter /> */}
    </div>
  );
}

export default App;

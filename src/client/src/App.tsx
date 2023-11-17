import SideBar from '@apps/Sidebar/views';
import SidebarWithRouter from '@apps/Sidebar/views/WithRouter';
import SseTester from '@components/SseTester';
import MainRoute from '@views';
import ClothingShowcase from '@views/ClothingShowcase';
import Lobby from '@views/lobby';
import { useRouter, Route } from 'wouter';

function App() {
  const router = useRouter();
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
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
      <Route path="/clothing-showcase">
        <ClothingShowcase />
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

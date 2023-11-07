import MessagesSandbox from '@components/sandbox/Messages';
import InfiniteScrollSandbox from '@components/sandbox/infinite';
import { Route, Router, Switch, useRouter } from 'wouter';

export default function SandboxRouter() {
  const router = useRouter();
  return (
    <Router base="/sandbox" parent={router}>
      <Switch>
        <Route path="/messages">
          <MessagesSandbox />
        </Route>
        <Route path="/infinite">
          <InfiniteScrollSandbox />
        </Route>
      </Switch>
    </Router>
  );
}

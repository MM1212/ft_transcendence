import MessagesSandbox from '@components/sandbox/Messages';
import { Route, Router, Switch, useRouter } from 'wouter';

export default function SandboxRouter() {
  const router = useRouter();
  return (
    <Router base="/sandbox" parent={router}>
      <Switch>
        <Route path="/messages">
          <MessagesSandbox />
        </Route>
      </Switch>
    </Router>
  );
}

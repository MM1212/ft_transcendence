import { Divider, Sheet } from '@mui/joy';
import FriendsHeader from '../components/FriendsHeader';
import FriendsGetter from '../components/FriendsGetter';
import { Redirect, Route, Router, Switch, useRouter } from 'wouter';
import PendingFriendsGetter from '../components/PendingFriendsGetter';

export default function FriendsPanel() {
  const router = useRouter();
  return (
    <Router base="/friends" parent={router}>
      <Sheet
        sx={{
          borderRight: '1px solid',
          borderColor: 'divider',
          height: '100%',
          overflowY: 'auto',
          width: '80dvh',
        }}
      >
        <FriendsHeader />
        <Divider />
        <Switch>
          <Route path="/">
            <FriendsGetter type="online" />
          </Route>
          <Route path="/online">
            <Redirect to="/" />
          </Route>
          <Route path="/all">
            <FriendsGetter type="all" />
          </Route>
          <Route path="/pending">
            <PendingFriendsGetter />
          </Route>
        </Switch>
      </Sheet>
    </Router>
  );
}

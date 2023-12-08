import { Divider, Sheet } from '@mui/joy';
import FriendsHeader from '../components/FriendsHeader';
import FriendsDisplay, {
  FriendsDisplayWrapper,
} from '../components/FriendsDisplay';
import { Redirect, Route, Router, Switch, useRouter } from 'wouter';
import PendingFriendsGetter from '../components/PendingFriendsGetter';
import { useRecoilValue } from 'recoil';
import friendsState from '../state';
import FriendBlockedDisplay from '../components/FriendsBlockedDisplay';
import React from 'react';

function OnlineFriends(): JSX.Element {
  const friends = useRecoilValue(friendsState.onlineFriends);
  return <FriendsDisplay ids={friends} label="online" />;
}

function AllFriends(): JSX.Element {
  const friends = useRecoilValue(friendsState.allFriends);
  return <FriendsDisplay ids={friends} label="all friends" />;
}

function BlockedFriends(): JSX.Element {
  const friends = useRecoilValue(friendsState.blocked);
  return React.useMemo(
    () => (
      <FriendsDisplayWrapper length={friends.length} label="blocked">
        {friends.map((id) => (
          <FriendBlockedDisplay key={id} id={id} />
        ))}
      </FriendsDisplayWrapper>
    ),
    [friends]
  );
}

export default function FriendsPanel() {
  const router = useRouter();
  return (
    <Router base="/friends" parent={router}>
      <Sheet
        sx={{
          borderRight: '1px solid',
          borderLeft: '1px solid',
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
            <OnlineFriends />
          </Route>
          <Route path="/online">
            <Redirect to="/" />
          </Route>
          <Route path="/all">
            <AllFriends />
          </Route>
          <Route path="/pending">
            <PendingFriendsGetter />
          </Route>
          <Route path="/blocked">
            <BlockedFriends />
          </Route>
        </Switch>
      </Sheet>
    </Router>
  );
}

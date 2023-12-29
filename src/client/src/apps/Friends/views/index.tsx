import { Divider, Sheet } from '@mui/joy';
import FriendsHeader from '../components/FriendsHeader';
import FriendsDisplay, {
  FriendsDisplayWrapper,
} from '../components/FriendsDisplay';
import { Redirect, Route, Router, Switch, useRouter } from 'wouter';
import { useRecoilValue } from 'recoil';
import friendsState from '../state';
import FriendBlockedDisplay from '../components/FriendsBlockedDisplay';
import React from 'react';
import { useGetNotificationsByTag } from '@apps/Inbox/state';
import NotificationsModel from '@typings/models/notifications';
import UsersModel from '@typings/models/users';
import FriendPendingDisplay from '../components/FriendsPendingDisplay';

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

function PendingFriends(): JSX.Element {
  const notifications =
    useGetNotificationsByTag<UsersModel.DTO.FriendRequestNotification>(
      NotificationsModel.Models.Tags.UserFriendsRequest
    );
  return React.useMemo(
    () => (
      <FriendsDisplayWrapper length={notifications.length} label="pending">
        {notifications
          .filter((n) => n.data.status === 'pending')
          .map((notif, i) => (
            <FriendPendingDisplay key={i} notif={notif} />
          ))}
      </FriendsDisplayWrapper>
    ),
    [notifications]
  );
}

export default function FriendsPanel() {
  return (
    <Router parent={useRouter()}>
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
          <Route path="/friends">
            <OnlineFriends />
          </Route>
          <Route path="/friends/online">
            <Redirect to="/friends/" />
          </Route>
          <Route path="/friends/all">
            <AllFriends />
          </Route>
          <Route path="/friends/pending">
            <PendingFriends />
          </Route>
          <Route path="/friends/blocked">
            <BlockedFriends />
          </Route>
        </Switch>
      </Sheet>
    </Router>
  );
}

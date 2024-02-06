import { Divider, Sheet } from "@mui/joy";
import FriendsHeader from "../components/FriendsHeader";
import FriendsDisplay, {
  FriendsDisplayWrapper,
} from "../components/FriendsDisplay";
import { Redirect, Route, Router, Switch, useRouter } from "wouter";
import { useRecoilValue } from "recoil";
import friendsState from "../state";
import FriendBlockedDisplay from "../components/FriendsBlockedDisplay";
import React from "react";
import { useGetNotificationsByTag } from "@apps/Inbox/state";
import NotificationsModel from "@typings/models/notifications";
import UsersModel from "@typings/models/users";
import FriendPendingDisplay from "../components/FriendsPendingDisplay";
import GenericPlaceholder from "@components/GenericPlaceholder";
import AccountGroupIcon from "@components/icons/AccountGroupIcon";
import CancelIcon from "@components/icons/CancelIcon";
import AccountClockIcon from "@components/icons/AccountClockIcon";

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
        {friends.length > 0 ? (
          <>
            {friends.map((id) => (
              <FriendBlockedDisplay id={id} key={id} />
            ))}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <GenericPlaceholder
              title="No Blocked User to Display"
              icon={<CancelIcon fontSize="xl4" />}
              path=""
            />
          </div>
        )}
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
  const pendingNotifications = notifications.filter(
    (n) => n.data.status === "pending"
  );
  return React.useMemo(
    () => (
      <FriendsDisplayWrapper length={notifications.length} label="pending">
        {pendingNotifications.length > 0 ? (
          <>
            {pendingNotifications.map((notif, i) => (
              <FriendPendingDisplay key={i} notif={notif} />
            ))}
          </>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <GenericPlaceholder
              title="No Pending Friend Requests"
              icon={<AccountClockIcon fontSize="xl4" />}
              path=""
            />
          </div>
        )}
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
          borderRight: "1px solid",
          borderLeft: "1px solid",
          borderColor: "divider",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          width: "80dvh",
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

import { useCurrentUser, useUser, usersAtom } from "@hooks/user";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  Divider,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  Sheet,
  Stack,
  Typography,
} from "@mui/joy";
import UserAchievements from "../components/UserAchievements";
import UserMatchHistory from "../components/UserMatchHistory";
import AvatarWithStatus, { UserAvatar } from "@components/AvatarWithStatus";
import DotsVerticalIcon from "@components/icons/DotsVerticalIcon";
import { Route, Switch, useParams } from "wouter";
import UsersModel from "@typings/models/users";
import { useRecoilValue } from "recoil";
import { navigate } from "wouter/use-location";
import React, { useLayoutEffect } from "react";
import { useFriends } from "@apps/Friends/hooks";
import { useUpdateUserModalActions } from "../hooks/useUpdateUserModal";
import useFriend from "@apps/Friends/hooks/useFriend";
import MessageIcon from "@components/icons/MessageIcon";
import UserMenuOptions from "../components/UserMenuOptions";
import AccountPlusIcon from "@components/icons/AccountPlusIcon";
import SingleMatchHist from "../components/SingleMatchHist";

function OtherOptions({
  user,
  friend,
}: {
  user: UsersModel.Models.IUserInfo;
  friend: boolean;
}) {
  const { goToMessages, sentFriendRequest } = useFriend(user.id);
  return (
    <ButtonGroup size="sm" variant="outlined">
      <Button
        size="sm"
        onClick={goToMessages}
        startDecorator={<MessageIcon size="sm" />}
      >
        Message
      </Button>
      {!friend && (
        <Button
          size="sm"
          startDecorator={<AccountPlusIcon size="sm" />}
          onClick={sentFriendRequest}
        >
          Friend Request
        </Button>
      )}
      <Dropdown>
        <MenuButton slots={{ root: IconButton }} data-last-child>
          <DotsVerticalIcon />
        </MenuButton>
        <Menu variant="outlined" sx={{ zIndex: 1300 }}>
          <React.Suspense
            fallback={<CircularProgress variant="plain" size="sm" />}
          >
            <UserMenuOptions user={user} />
          </React.Suspense>
        </Menu>
      </Dropdown>
    </ButtonGroup>
  );
}

function UserProfile({
  user,
  affiliation,
}: {
  user: UsersModel.Models.IUserInfo;
  affiliation: "me" | "friend" | "unknown";
}) {
  const { open: openUpdateModal } = useUpdateUserModalActions();
  const users = [
    useUser(1),
    useUser(2),
    useUser(3),
    useUser(4),
    useUser(5),
    useUser(6),
    useUser(7),
    useUser(9),
    useUser(10),
    useUser(11),
    useUser(12),
  ];
  return (
    <Sheet
      sx={{
        width: "45dvh",
        height: "90dvh",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
        overflow="hidden"
      >
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
          sx={{
            width: "100%",
            height: "30dvh",
          }}
          position="relative"
          p={1}
          spacing={0.5}
        >
          {affiliation === "me" ? (
            <UserAvatar
              sx={(theme) => ({
                width: theme.spacing(17),
                height: theme.spacing(17),
                transition: theme.transitions.create("opacity"),
                "&:hover": {
                  cursor: "pointer",
                  opacity: 0.8,
                },
              })}
              src={user?.avatar}
              onClick={() => openUpdateModal()}
            />
          ) : (
            <AvatarWithStatus
              sx={(theme) => ({
                width: theme.spacing(17),
                height: theme.spacing(17),
              })}
              src={user?.avatar}
              status={user?.status}
              badgeProps={{
                size: "lg",
              }}
            />
          )}
          <Typography level="h2">{user.nickname}</Typography>
          {affiliation !== "me" && (
            <OtherOptions user={user} friend={affiliation === "friend"} />
          )}
        </Stack>
        <Divider />
        <UserAchievements />
        <Divider />
        <Stack sx={{ height: "100%", width: "100%", overflow: "auto" }}>
          {users.map((team, index) => (
            <SingleMatchHist key={index} />
          ))}
        </Stack>
      </Stack>
    </Sheet>
  );
}

function UserProfileById() {
  const { userId } = useParams();
  const user = useRecoilValue(usersAtom(parseInt(userId!)));
  const friends = useFriends();

  useLayoutEffect(() => {
    if (user) return;
    const searchParams = new URLSearchParams();
    searchParams.append("t", "Profile Not Found");
    navigate(`/error?${searchParams.toString()}`);
  }, [user]);

  if (!user) {
    return null;
  }
  return (
    <UserProfile
      user={user!}
      affiliation={friends.includes(parseInt(userId!)) ? "friend" : "unknown"}
    />
  );
}

function UserProfileByMe() {
  const user = useCurrentUser();
  return <UserProfile user={user!} affiliation={"me"} />;
}

export default function ProfileView() {
  return (
    <Switch>
      <Route path="/profile/me">
        <UserProfileByMe />
      </Route>
      <Route path="/profile/:userId">
        <UserProfileById />
      </Route>
    </Switch>
  );
}

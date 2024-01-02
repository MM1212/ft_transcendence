import { useCurrentUser, useUser, usersAtom } from "@hooks/user";
import {
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  Divider,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  Sheet,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy';
import UserAchievements from '../components/UserAchievements';
import AvatarWithStatus, { UserAvatar } from '@components/AvatarWithStatus';
import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';
import { Route, Switch, useParams } from 'wouter';
import UsersModel from '@typings/models/users';
import { useRecoilValue } from 'recoil';
import { navigate } from 'wouter/use-location';
import React, { useLayoutEffect } from 'react';
import { useFriends } from '@apps/Friends/hooks';
import { useUpdateUserModalActions } from '../hooks/useUpdateUserModal';
import useFriend from '@apps/Friends/hooks/useFriend';
import MessageIcon from '@components/icons/MessageIcon';
import UserMenuOptions from '../components/UserMenuOptions';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import ProfileMatchHistory from '../components/ProfileMatchHistory';
import CreditsIcon from '@components/CreditsIcon';

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

  return (
    <Sheet
      sx={{
        width: "45dvh",
        height: "100%",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            width: "100%",
          }}
          position="relative"
          p={1}
          spacing={1}
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
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              level="h2"
              endDecorator={
                <Tooltip title="Credits">
                  <Chip
                    variant="soft"
                    color="neutral"
                    size="lg"
                    startDecorator={<CreditsIcon />}
                  >
                    {user.credits}
                  </Chip>
                </Tooltip>
              }
            >
              {user.nickname}
            </Typography>
          </Stack>
          {affiliation !== 'me' && (
            <OtherOptions user={user} friend={affiliation === 'friend'} />
          )}
        </Stack>
        <Divider />
        <UserAchievements id={affiliation === 'me' ? undefined : user.id} />
        <Divider />
        <ProfileMatchHistory id={affiliation === 'me' ? undefined : user.id} />
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

import { useCurrentUser, usersAtom } from '@hooks/user';
import {
  Button,
  ButtonGroup,
  Divider,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import UserAchievements from '../components/UserAchievements';
import UserMatchHistory from '../components/UserMatchHistory';
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

function OtherOptions({
  user,
  friend,
}: {
  user: UsersModel.Models.IUserInfo;
  friend: boolean;
}) {
  const { goToMessages } = useFriend(user.id);
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
        <Button size="sm" startDecorator={<AccountPlusIcon size="sm" />}>
          Friend Request
        </Button>
      )}
      <Dropdown>
        <MenuButton slots={{ root: IconButton }} data-last-child>
          <DotsVerticalIcon />
        </MenuButton>
        <Menu variant="outlined" sx={{ zIndex: 1300 }}>
          <UserMenuOptions user={user} />
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
  affiliation: 'me' | 'friend' | 'unknown';
}) {
  const { open: openUpdateModal } = useUpdateUserModalActions();
  return (
    <Sheet
      sx={{
        height: '100%',
        width: '45dvh',
        borderLeft: '1px solid',
        borderColor: 'divider',
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
          width="100%"
          position="relative"
          p={1}
          spacing={0.5}
        >
          {affiliation === 'me' ? (
            <UserAvatar
              sx={(theme) => ({
                width: theme.spacing(17),
                height: theme.spacing(17),
                transition: theme.transitions.create('opacity'),
                '&:hover': {
                  cursor: 'pointer',
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
                size: 'lg',
              }}
            />
          )}
          <Typography level="h2">{user.nickname}</Typography>
          {affiliation !== 'me' && (
            <OtherOptions user={user} friend={affiliation === 'friend'} />
          )}
        </Stack>
        <Divider />
        <UserAchievements />
        <Divider />
        <UserMatchHistory />
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
    searchParams.append('t', 'Profile Not Found');
    navigate(`/error?${searchParams.toString()}`);
  }, [user]);

  if (!user) {
    return null;
  }
  return (
    <UserProfile
      user={user!}
      affiliation={friends.includes(parseInt(userId!)) ? 'friend' : 'unknown'}
    />
  );
}

function UserProfileByMe() {
  const user = useCurrentUser();
  return <UserProfile user={user!} affiliation={'me'} />;
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

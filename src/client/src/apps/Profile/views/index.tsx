import { useCurrentUser } from '@hooks/user';
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
import { Redirect, Route, Switch, useParams } from 'wouter';
import UsersModel from '@typings/models/users';
import React from 'react';
import { useFriends } from '@apps/Friends/hooks';
import { useUpdateUserModalActions } from '../hooks/useUpdateUserModal';
import useFriend from '@apps/Friends/hooks/useFriend';
import MessageIcon from '@components/icons/MessageIcon';
import UserMenuOptions from '../components/UserMenuOptions';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import ProfileMatchHistory from '../components/ProfileMatchHistory';
import CreditsIcon from '@components/CreditsIcon';
import { numberExtentFormatter, numberFormatter } from '@lib/intl';
import TrophyAwardIcon from '@components/icons/TrophyAwardIcon';
import { useTunnelEndpoint } from '@hooks/tunnel';
import GenericPlaceholder from '@components/GenericPlaceholder';
import AccountOffIcon from '@components/icons/AccountOffIcon';

function OtherOptions({
  user,
  friend,
}: {
  user: UsersModel.Models.IUserInfo;
  friend: boolean;
}) {
  const { goToMessages, sendFriendRequest } = useFriend(user.id);
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
          onClick={sendFriendRequest}
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
  affiliation: 'me' | 'friend' | 'unknown';
}) {
  const { open: openUpdateModal } = useUpdateUserModalActions();
  return (
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
        sx={{
          width: '100%',
        }}
        position="relative"
        p={1}
        spacing={1}
      >
        {affiliation === 'me' ? (
          <UserAvatar
            sx={(theme) => ({
              width: theme.spacing(17),
              height: theme.spacing(17),
              transition: theme.transitions.create('opacity'),
              '&:hover': {
                cursor: 'pointer',
                transition: theme.transitions.create('opacity'),
                '&:hover': {
                  cursor: 'pointer',
                  opacity: 0.8,
                },
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
        <Stack alignItems="center" spacing={1}>
          <Typography level="h2">{user.nickname}</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            {affiliation === 'me' && (
              <Tooltip
                title={`${numberExtentFormatter.format(user.credits)} Credits`}
              >
                <Chip
                  variant="soft"
                  color="primary"
                  size="lg"
                  startDecorator={<CreditsIcon />}
                >
                  {numberFormatter.format(user.credits)}
                </Chip>
              </Tooltip>
            )}
            <Tooltip title="Elo Rating">
              <Chip
                variant="soft"
                color="warning"
                size="lg"
                startDecorator={<TrophyAwardIcon />}
              >
                {user.leaderboard.elo}
              </Chip>
            </Tooltip>
          </Stack>
          {/* <Typography>Rank Placeholder</Typography> */}
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
  );
}

function UserProfileById() {
  const { userId }: { userId: string } = useParams();
  const friends = useFriends();
  const isUserId = !isNaN(parseInt(userId));
  const {
    data: user,
    isLoading,
    isValidating,
    error,
  } = useTunnelEndpoint<
    UsersModel.Endpoints.GetUser | UsersModel.Endpoints.QueryUserByNickname
  >(
    isUserId
      ? UsersModel.Endpoints.Targets.GetUser
      : UsersModel.Endpoints.Targets.QueryUserByNickname,
    isUserId ? { id: parseInt(userId) } : { nickname: userId }
  );

  if (isLoading || isValidating) return <CircularProgress variant="plain" />;
  if (!user || error)
    return (
      <GenericPlaceholder
        icon={<AccountOffIcon fontSize="xl4" />}
        title="User not found"
        label="The user you are looking for does not exist. Try searching here."
        path="/users/search"
        centerVertical
      />
    );

  return (
    <UserProfile
      user={user!}
      affiliation={friends.includes(parseInt(userId!)) ? 'friend' : 'unknown'}
    />
  );
}

function SanitizeParams() {
  const { userId } = useParams();
  if (!userId) return <Redirect to={`/profile/me`} replace />;
  return <UserProfileById />;
}

function UserProfileByMe() {
  const user = useCurrentUser();
  return <UserProfile user={user!} affiliation={'me'} />;
}

export default function ProfileView() {
  return (
    <Sheet
      sx={{
        width: '45dvh',
        height: '100%',
        borderLeft: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Switch>
        <Route path="/profile/me">
          <UserProfileByMe />
        </Route>
        <Route path="/profile/:userId*">
          <SanitizeParams />
        </Route>
      </Switch>
    </Sheet>
  );
}

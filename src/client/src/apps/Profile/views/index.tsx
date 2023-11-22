import { useCurrentUser, usersAtom } from '@hooks/user';
import {
  Button,
  ButtonGroup,
  Divider,
  IconButton,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import UserAchievements from '../components/UserAchievements';
import UserMatchHistory from '../components/UserMatchHistory';
import AvatarWithStatus from '@components/AvatarWithStatus';
import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';
import { Route, Switch, useParams } from 'wouter';
import UsersModel from '@typings/models/users';
import { useRecoilValue } from 'recoil';
import { navigate } from 'wouter/use-location';
import { useLayoutEffect } from 'react';
import { useFriends } from '@apps/Friends/hooks';

function UserProfile({
  user,
  affiliation,
}: {
  user: UsersModel.Models.IUserInfo;
  affiliation: 'me' | 'friend' | 'unknown';
}) {
  console.log(affiliation);
  return (
    <Sheet
      style={{
        height: "100%",
        width: "45dvh",
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
          <Typography level="h2">{user.nickname}</Typography>
          {affiliation !== 'me' && (
            <ButtonGroup size="sm" variant="outlined">
              <Button size="sm">Message</Button>
              {affiliation === 'unknown' && (
                <Button size="sm">Friend Request</Button>
              )}
              <IconButton>
                <DotsVerticalIcon />
              </IconButton>
            </ButtonGroup>
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

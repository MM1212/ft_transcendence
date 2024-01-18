import { useRecoilValue } from 'recoil';
import profileState, { UserSearchResult } from '../state';
import {
  ButtonGroup,
  CircularProgress,
  Dropdown,
  IconButton,
  Menu,
  MenuButton,
  Sheet,
  Stack,
  Typography,
} from '@mui/joy';
import AvatarWithStatus, { UserAvatar } from '@components/AvatarWithStatus';
import AccountPlusIcon from '@components/icons/AccountPlusIcon';
import MessageIcon from '@components/icons/MessageIcon';
import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';
import UserMenuOptions from './UserMenuOptions';
import useFriend from '@apps/Friends/hooks/useFriend';
import EmoticonSadOutlineIcon from '@components/icons/EmoticonSadOutlineIcon';
import React from 'react';

function SearchResult(
  user: UserSearchResult
): JSX.Element {
  const { avatar, nickname, status, isFriend, isBlocked, friendRequestSent } = user;
  const { goToProfile, goToMessages, sendFriendRequest } = useFriend(user.id);
  return (
    <Sheet
      sx={{
        py: 1,
        px: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 'sm',
        transition: (theme) => theme.transitions.create('background-color'),
        '&:hover': {
          backgroundColor: (theme) => theme.palette.background.level1,
          cursor: 'pointer',
        },
        width: '100%',
      }}
      onClick={goToProfile}
      variant="outlined"
    >
      <Stack spacing={1} direction="row" alignItems="center">
        {isFriend ? (
          <AvatarWithStatus size="md" src={avatar} status={status} />
        ) : (
          <UserAvatar size="md" src={avatar} />
        )}
        <Typography level="body-md">{nickname}</Typography>
      </Stack>
      <ButtonGroup
        variant="outlined"
        size="sm"
        onClick={(ev) => ev.stopPropagation()}
      >
        {!isFriend && !isBlocked && !friendRequestSent ? (
          <IconButton onClick={sendFriendRequest}>
            <AccountPlusIcon />
          </IconButton>
        ) : undefined}
        <IconButton
          {...((isFriend || isBlocked || friendRequestSent) && { 'data-first-child': true })}
          onClick={goToMessages}
        >
          <MessageIcon />
        </IconButton>
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
    </Sheet>
  );
}

export default function UserSearchResults(): JSX.Element {
  const results = useRecoilValue(profileState.searchResults);
  const loading = useRecoilValue(profileState.searchLoading);
  const dirty = useRecoilValue(profileState.searchInputDirty);
  return (
    <Stack spacing={1} width="100%" alignItems="center" flexGrow={1}>
      {loading ? (
        <CircularProgress
          variant="plain"
          sx={{ mt: (theme) => `${theme.spacing(3)}!important` }}
        />
      ) : results.length === 0 && dirty ? (
        <Stack
          alignItems="center"
          my={(theme) => `${theme.spacing(3)}!important`}
          spacing={1}
        >
          <EmoticonSadOutlineIcon
            sx={(theme) => ({
              width: theme.spacing(8),
              height: theme.spacing(8),
            })}
          />
          <Typography level="body-lg">No results</Typography>
        </Stack>
      ) : (
        results.map((result) => <SearchResult key={result.id} {...result} />)
      )}
    </Stack>
  );
}

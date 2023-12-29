import { UserAvatar } from '@components/AvatarWithStatus';
import KarateIcon from '@components/icons/KarateIcon';
import { useCurrentUser, useUser } from '@hooks/user';
import { Box, Chip, IconButton, Sheet } from '@mui/joy';
import { Divider } from '@mui/joy';
import { Stack, Typography } from '@mui/joy';
import React from 'react';
import {
  ChangeOwnerButton,
  KickInvitedButton,
  KickParticipantButton,
} from './LobbyParticipantButtons';
import pongGamesState from '../state';
import { useRecoilValue } from 'recoil';
import CrownIcon from '@components/icons/CrownIcon';

function DisplayStackedUser({ userId }: { userId: number }) {
  const user = useUser(userId);
  const lobbyOwner = useRecoilValue(pongGamesState.lobbyOwner);
  if (lobbyOwner === null) return null;
  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <UserAvatar src={user?.avatar} sx={{ width: 20, height: 20 }} />
      <Typography level="body-sm" sx={{ ml: 2 }}>
        {user?.nickname}
      </Typography>
      {user?.id === lobbyOwner && (
        <Chip color="warning" variant="plain" size="sm">
          <CrownIcon size="sm" fontSize="sm" />
        </Chip>
      )}
      <Box display="flex" alignItems="center" gap={1} ml="auto">
        <ChangeOwnerButton id={userId} ownerId={lobbyOwner} />
        <KickParticipantButton id={userId} ownerId={lobbyOwner} />
      </Box>
    </Stack>
  );
}

function DisplayInvitedUser({ userId }: { userId: number }) {
  const user = useUser(userId);
  const lobbyOwner = useRecoilValue(pongGamesState.lobbyOwner);
  if (lobbyOwner === null) return null;
  return (
    <Stack
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <UserAvatar src={user?.avatar} sx={{ width: 20, height: 20 }} />
      <Typography level="body-sm" sx={{ ml: 2 }}>
        {user?.nickname}
      </Typography>
      <Box display="flex" alignItems="center" gap={1} ml="auto">
        <KickInvitedButton id={userId} ownerId={lobbyOwner} />
      </Box>
    </Stack>
  );
}

export function LobbySpectatorsList({
  usersId,
  type,
}: {
  usersId: number[];
  type : string;
}) {
  return (
    <>
      <Stack sx={{ width: '100' }}>
        {usersId.length > 0 ? (
          usersId.map((user, index) => (
            <React.Fragment key={index}>
              <DisplayStackedUser userId={user} key={index}/>
              <Divider sx={{ mb: 2 }} />
            </React.Fragment>
          ))
        ) : (
          <Typography level="body-sm">{type}</Typography>
        )}
      </Stack>
    </>
  );
}

export function LobbyInvitedList({
  usersId,
  type,
}: {
  usersId: number[];
  type: string;
}) {
  return (
    <>
      <Stack sx={{ width: '100' }}>
        {usersId.length > 0 ? (
          usersId.map((user, index) => (
            <React.Fragment key={index}>
              <DisplayInvitedUser userId={user} key={index}/>
              <Divider sx={{ mb: 2 }} />
            </React.Fragment>
          ))
        ) : (
          <Typography level="body-sm">{type}</Typography>
        )}
      </Stack>
    </>
  );
}

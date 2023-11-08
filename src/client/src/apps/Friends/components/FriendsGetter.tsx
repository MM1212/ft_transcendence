import { Divider, IconButton, Typography } from '@mui/joy';
import { Sheet, Stack } from '@mui/joy';
import { sampleUsers } from '@apps/Lobby/state/mockup';
import AvatarWithStatus from '@components/AvatarWithStatus';
import UsersModel from '@typings/models/users';
import React from 'react';
import { userStatusToString } from '@utils/userStatus';
import MessageIcon from '@components/icons/MessageIcon';
import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';

export default function FriendsGetter({ type }: { type: 'all' | 'online' }) {
  const getOnlineFriends = () => {
    if (type === 'all') {
      return 'ALL FRIENDS - ' + sampleUsers.length;
    }
    return (
      'ONLINE - ' +
      sampleUsers.reduce((acc, user) => {
        if (user.status !== UsersModel.Models.Status.Offline) {
          return acc + 1;
        }
        return acc;
      }, 0)
    );
  };
  const sortedChats = React.useMemo(
    () =>
      sampleUsers
        .filter((user) => {
          switch (type) {
            case 'all':
              return true;
            case 'online':
              return user.status !== UsersModel.Models.Status.Offline;
            default:
              return true;
          }
        })
        .sort((a, b) => {
          const aOnline = a.status !== UsersModel.Models.Status.Offline;
          const bOnline = b.status !== UsersModel.Models.Status.Offline;
          if (aOnline && !bOnline) {
            return -1;
          }
          if (!aOnline && bOnline) {
            return 1;
          }
          return 0;
        }),
    [type]
  );

  return (
    <Sheet
      sx={{
        overflowY: 'auto',
      }}
    >
      <Typography fontWeight={'light'} fontSize={11} p={1}>
        {getOnlineFriends()}
      </Typography>
      <Divider />
      <Stack p={1.5} spacing={1} justifyContent="flex-end">
        {sortedChats.map((user) => (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1.5}
            key={user.id}
            sx={{
              width: '100%',
              borderRadius: (theme) => theme.radius.sm,
              p: 1,
              transition: (theme) =>
                theme.transitions.create('background-color', {}),
              '&:hover': {
                backgroundColor: 'background.level1',
                cursor: 'pointer',
              },
            }}
          >
            <Stack direction="row" spacing={1.5}>
              <AvatarWithStatus
                status={user.status}
                src={user.avatar}
                size="lg"
              />
              <Stack>
                <Typography level="title-md">{user.nickname}</Typography>
                <Typography level="body-sm">
                  {userStatusToString(user.status)}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" ml="auto">
              <IconButton
                color="neutral"
                variant="soft"
                sx={{
                  borderRadius: (theme) => theme.radius.xl,
                }}
              >
                <MessageIcon size="sm" />
              </IconButton>
              <IconButton
                color="neutral"
                sx={{ borderRadius: (theme) => theme.radius.xl }}
              >
                <DotsVerticalIcon />
              </IconButton>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Sheet>
  );
}

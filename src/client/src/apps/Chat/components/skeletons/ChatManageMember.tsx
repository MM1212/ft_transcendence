import AccountIcon from '@components/icons/AccountIcon';
import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';
import { Stack, Typography, IconButton, Avatar, Skeleton } from '@mui/joy';
import { randomInt } from '@utils/random';
import React from 'react';

function _ChatManageMemberSkeleton(): JSX.Element {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      p={1}
    >
      <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>
        <Avatar size="lg">
          <Skeleton variant="circular" />
        </Avatar>
        <Stack spacing={0.1} height="100%" justifyContent="center" flexGrow={1}>
          <Typography level="title-sm">
            <Skeleton>{'0'.repeat(randomInt(10, 20))}</Skeleton>
          </Typography>
          <Typography level="body-xs" color="neutral">
            <Skeleton>{'0'.repeat(randomInt(6, 10))}</Skeleton>
          </Typography>
        </Stack>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        spacing={1}
        flexGrow={1}
      >
        <IconButton size="sm" variant="plain" color="neutral" disabled>
          <AccountIcon />
          <Skeleton
            sx={{
              borderRadius: 'lg',
            }}
          />
        </IconButton>
        <IconButton size="sm" variant="plain" color="neutral" disabled>
          <DotsVerticalIcon />
          <Skeleton
            sx={{
              borderRadius: 'lg',
            }}
          />
        </IconButton>
      </Stack>
    </Stack>
  );
}

const ChatManageMemberSkeleton = React.memo(_ChatManageMemberSkeleton);

export default ChatManageMemberSkeleton;

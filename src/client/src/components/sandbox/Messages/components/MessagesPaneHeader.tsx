import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { toggleMessagesPane } from '../utils';
import { useRecoilValue } from 'recoil';
import chatsState from '../state';
import ChevronLeftIcon from '@components/icons/ChevronLeftIcon';
import PhoneInTalkIcon from '@components/icons/PhoneInTalkIcon';
import DotsVerticalIcon from '@components/icons/DotsVerticalIcon';
import AvatarWithStatus from './AvatarWithStatus';
import ChatsModel from '@typings/models/chat';

export default function MessagesPaneHeader() {
  const { name, photo, status, participantNames, type } = useRecoilValue(
    chatsState.selectedChatInfo
  );

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.body',
      }}
      py={{ xs: 2, md: 2 }}
      px={{ xs: 1, md: 2 }}
    >
      <Stack direction="row" spacing={{ xs: 1, md: 1 }} alignItems="center">
        <IconButton
          variant="plain"
          color="neutral"
          size="sm"
          sx={{
            display: { xs: 'inline-flex', sm: 'none' },
          }}
          onClick={() => toggleMessagesPane()}
        >
          <ChevronLeftIcon />
        </IconButton>
        {type === ChatsModel.Models.ChatType.Direct ? (
          <AvatarWithStatus
            status={status}
            src={photo ?? undefined}
            size="lg"
            inset=".4rem"
          />
        ) : (
          <Avatar src={photo ?? undefined} size="lg" />
        )}{' '}
        <Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography fontWeight="lg" fontSize="lg" component="h2" noWrap>
              {name}
            </Typography>
          </Stack>
          {participantNames && (
            <Typography
              fontSize="sm"
              color="neutral"
              sx={{
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {participantNames}
            </Typography>
          )}
        </Stack>
      </Stack>
      <Stack spacing={1} direction="row" alignItems="center">
        <Button
          startDecorator={<PhoneInTalkIcon />}
          color="neutral"
          variant="outlined"
          size="sm"
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
          }}
        >
          Call
        </Button>
        <Button
          color="neutral"
          variant="outlined"
          size="sm"
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
          }}
        >
          View profile
        </Button>

        <IconButton size="sm" variant="plain" color="neutral">
          <DotsVerticalIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
}

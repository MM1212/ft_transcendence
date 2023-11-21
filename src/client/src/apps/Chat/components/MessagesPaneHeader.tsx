import Avatar from '@mui/joy/Avatar';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { useRecoilValue } from 'recoil';
import chatsState from '@/apps/Chat/state';
import AvatarWithStatus from '@components/AvatarWithStatus';
import ChatsModel from '@typings/models/chat';
import ChatManageMenu from './ChatManage';

export default function MessagesPaneHeader() {
  const { name, photo, status, participantNames, type } = useRecoilValue(
    chatsState.selectedChatInfo
  );

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.body',
      }}
      py={{ xs: 2, md: 2 }}
      px={{ xs: 1, md: 2 }}
    >
      <Stack direction="row" spacing={{ xs: 1, md: 1 }} alignItems="center">
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
      <ChatManageMenu />
    </Stack>
  );
}

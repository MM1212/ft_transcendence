import Avatar from '@mui/joy/Avatar';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import AvatarWithStatus from '@components/AvatarWithStatus';
import ChatsModel from '@typings/models/chat';
import ChatManageMenu from './ChatManage';
import { Tooltip } from '@mui/joy';
import { useSelectedChat } from '../hooks/useChat';

export default function MessagesPaneHeader() {
  const { useHeaderNames, useInfo } = useSelectedChat();
  const { name, photo, status, type, id, topic } = useInfo();
  const participantNames = useHeaderNames();
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
            {topic && (
              <Tooltip placement="bottom" title={topic} enterDelay={1000}>
                <Typography level="body-xs">
                  {topic.length > 20 ? topic.slice(0, 20) + '...' : topic}
                </Typography>
              </Tooltip>
            )}
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
      <ChatManageMenu key={id} />
    </Stack>
  );
}

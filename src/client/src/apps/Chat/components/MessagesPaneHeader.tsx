import Avatar from '@mui/joy/Avatar';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import { UserAvatar } from '@components/AvatarWithStatus';
import ChatsModel from '@typings/models/chat';
import ChatManageMenu from './ChatManage';
import { Badge, Tooltip } from '@mui/joy';
import { useSelectedChat } from '../hooks/useChat';
import LockIcon from '@components/icons/LockIcon';
import CircleIcon from '@components/icons/CircleIcon';
import { userStatusToColor, userStatusToString } from '@utils/userStatus';
import AccountGroupIcon from '@components/icons/AccountGroupIcon';

export default function MessagesPaneHeader() {
  const { useHeaderNames, useInfo } = useSelectedChat();
  const { name, photo, status, type, id, topic, authorization } = useInfo();
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
          <UserAvatar src={photo ?? undefined} size="lg" />
        ) : (
          <Badge
            badgeContent={<LockIcon size="xs" />}
            color="warning"
            badgeInset="14%"
            size="sm"
            variant="plain"
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            invisible={authorization !== ChatsModel.Models.ChatAccess.Private}
          >
            <Avatar src={photo ?? undefined} size="lg">
              <AccountGroupIcon />
            </Avatar>
          </Badge>
        )}
        <Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography level="title-md" fontWeight="lg">
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
          {type === ChatsModel.Models.ChatType.Direct ? (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CircleIcon
                size="xxs"
                sx={{
                  color: (theme) => theme.getCssVar(userStatusToColor(status)),
                }}
              />
              <Typography level="body-xs">
                {userStatusToString(status)}
              </Typography>
            </Stack>
          ) : (
            participantNames && (
              <Typography
                fontSize="sm"
                color="neutral"
                sx={{
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                {participantNames}
              </Typography>
            )
          )}
        </Stack>
      </Stack>
      <ChatManageMenu key={id} />
    </Stack>
  );
}

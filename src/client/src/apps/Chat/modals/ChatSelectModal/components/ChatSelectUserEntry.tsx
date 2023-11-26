import { ChatSelectEntryProps } from '../state/types';
import ChatSelectEntryWrapper from './EntryWrapper';
import {Stack, Typography } from '@mui/joy';
import { useUser } from '@hooks/user';
import { UserAvatar } from '@components/AvatarWithStatus';
import CircleIcon from '@components/icons/CircleIcon';
import { userStatusToColor, userStatusToString } from '@utils/userStatus';

export default function ChatSelectUserEntry(
  props: ChatSelectEntryProps
): JSX.Element {
  const user = useUser(props.id);
  if (!user) return <></>;

  return (
    <ChatSelectEntryWrapper {...props}>
      <UserAvatar src={user.avatar} size="md" />
      <Stack spacing={0.1} height="100%" justifyContent="center" flexGrow={1}>
        <Typography level="title-sm">{user.nickname}</Typography>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <CircleIcon
            size="xxs"
            sx={{
              color: (theme) => theme.getCssVar(userStatusToColor(user.status)),
            }}
          />
          <Typography level="body-xs">
            {userStatusToString(user.status)}
          </Typography>
        </Stack>
      </Stack>
    </ChatSelectEntryWrapper>
  );
}

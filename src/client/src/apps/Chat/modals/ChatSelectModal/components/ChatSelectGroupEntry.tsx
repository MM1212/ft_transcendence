import useChat from '@apps/Chat/hooks/useChat';
import { ChatSelectEntryProps } from '../state/types';
import ChatSelectEntryWrapper from './EntryWrapper';
import { Avatar, Stack, Typography } from '@mui/joy';
import AccountGroupIcon from '@components/icons/AccountGroupIcon';

export default function ChatSelectGroupEntry(
  props: ChatSelectEntryProps
): JSX.Element {
  const { name, photo, participantCount } = useChat(props.id).useInfo();

  return (
    <ChatSelectEntryWrapper {...props}>
      <Avatar src={photo ?? undefined}>
        <AccountGroupIcon />
      </Avatar>
      <Stack spacing={0.1} height="100%" justifyContent="center" flexGrow={1}>
        <Typography level="title-sm">{name}</Typography>
        <Typography level="body-xs" color="neutral">
          {participantCount} members
        </Typography>
      </Stack>
    </ChatSelectEntryWrapper>
  );
}

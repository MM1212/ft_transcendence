import { Button, Sheet, Typography } from '@mui/joy';
import useChat from '../hooks/useChat';
import React from 'react';
import useFriend from '@apps/Friends/hooks/useFriend';

export default function MessageInputBlocked({
  id,
}: {
  id: number;
}): JSX.Element {
  const { useParticipants, useSelfParticipant } = useChat(id);
  const participants = useParticipants();
  const selfParticipant = useSelfParticipant();
  const targetUserId = React.useMemo(() => {
    const other = participants.find((x) => x.id !== selfParticipant.id);
    return other!.userId;
  }, [participants, selfParticipant]);
  const { unblock } = useFriend(targetUserId);
  return (
    <Sheet
      sx={{
        height: 'fit-content',
        m: 1,
        borderRadius: 'md',
        p: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography level="body-sm">
        You cannot send messages to a user you have blocked.
      </Typography>
      <Button variant="solid" size="sm" color="neutral" onClick={unblock}>
        Unblock
      </Button>
    </Sheet>
  );
}

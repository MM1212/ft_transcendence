import { useCurrentUser } from '@hooks/user';
import { Divider, Sheet } from '@mui/joy';
import LobbyGameTypography from '@apps/GameLobby/components/LobbyGameTypography';
import MatchHistoryList from '@apps/MatchHistory/components/MatchHistoryList';
import { useParams } from 'wouter';
import { useEffect } from 'react';
import { navigate } from 'wouter/use-location';

export default function MatchHistory() {
  const { id: targetId } = useParams<{ id: string }>();

  useEffect(() => {
    if (!targetId || (targetId !== 'me' && isNaN(parseInt(targetId)))) {
      navigate('/error?t=404', { replace: true });
    }
  }, [targetId]);
  const user = useCurrentUser();
  if (!user) return null;
  return (
    <Sheet
      sx={{
        width: '80dvh',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}
    >
      <LobbyGameTypography level="body-lg">Match History</LobbyGameTypography>
      <Divider />
      <MatchHistoryList
        targetId={targetId === 'me' ? user.id : parseInt(targetId)!}
      />
    </Sheet>
  );
}

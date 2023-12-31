import MatchHistoryEntryHeader from '@apps/MatchHistory/components/MatchHistoryEntryHeader';
import { Sheet } from '@mui/joy';
import { navigate } from 'wouter/use-location';

export default function SingleMatchHist({
  matchId,
  profileId,
}: {
  matchId: number;
  profileId?: number;
}) {
  return (
    <Sheet
      variant="plain"
      sx={{
        width: '100%',
        p: 2,
        borderRadius: (theme) => theme.radius.md,
        transition: (theme) => theme.transitions.create('background-color'),
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: (theme) => theme.palette.background.level1,
        },
      }}
      onClick={() =>
        navigate(`/pong/history/${profileId ?? 'me'}?match_id=${matchId}`)
      }
    >
      <MatchHistoryEntryHeader />
    </Sheet>
  );
}

import MatchHistoryEntryHeader from '@apps/MatchHistory/components/MatchHistoryEntryHeader';
import { useCurrentUser } from '@hooks/user';
import { Sheet } from '@mui/joy';
import PongHistoryModel from '@typings/models/pong/history';
import { navigate } from 'wouter/use-location';

export default function SingleMatchHist({
  profileId,
  ...rest
}: {
  profileId?: number;
} & PongHistoryModel.Models.Match) {
  const user = useCurrentUser();
  if (!user) return null;
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
        navigate(`/pong/history/${profileId ?? 'me'}?match_id=${rest.id}`)
      }
    >
      <MatchHistoryEntryHeader {...rest} targetId={profileId ?? user.id} />
    </Sheet>
  );
}

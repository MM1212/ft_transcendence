import { Box } from '@mui/joy';
import MatchHistoryEntryHeader from './MatchHistoryEntryHeader';
import PongHistoryModel from '@typings/models/pong/history';

export default function MatchHistoryEntry(
  props: PongHistoryModel.Models.Match & {
    targetId: number;
    size?: number;
  }
): JSX.Element {
  return (
    <Box width="100%" p={2}>
      <MatchHistoryEntryHeader {...props} />
    </Box>
  );
}

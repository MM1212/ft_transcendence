import { Box } from '@mui/joy';
import MatchHistoryEntryHeader from './MatchHistoryEntryHeader';

export default function MatchHistoryEntry(): JSX.Element {
  return (
    <Box width="100%" p={2}>
      <MatchHistoryEntryHeader />
    </Box>
  );
}

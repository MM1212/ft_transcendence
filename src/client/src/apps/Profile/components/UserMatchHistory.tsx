import { Box, Divider, Stack, Typography } from '@mui/joy';
import SingleMatchHist from './SingleMatchHist';

export default function UserMatchHistory() {
  return (
    <Box overflow="auto" height="100%" width="100%">
      <Stack width="100%" alignItems="center" spacing={1} p={1}>
        <Typography level="h2">Match History</Typography>
        <Stack
          alignItems={'center'}
          justifyContent={'flex-start'}
          spacing={1.5}
          width="100%"
        >
          <SingleMatchHist />
          <Divider />
          <SingleMatchHist />
          <Divider />
          <SingleMatchHist />
          <Divider />
          <SingleMatchHist />
          <Divider />
          <SingleMatchHist />
        </Stack>
      </Stack>
    </Box>
  );
}

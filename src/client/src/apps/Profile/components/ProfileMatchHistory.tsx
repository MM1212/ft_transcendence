import { Box, Divider, Stack, Typography } from '@mui/joy';
import SingleMatchHist from './SingleMatchHist';
import React from 'react';

export default function ProfileMatchHistory({ id }: { id?: number }) {
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
          {[...new Array(20)].map((_, index) => (
            <React.Fragment key={index}>
              <SingleMatchHist matchId={index} profileId={id} />
              {index !== 9 && <Divider />}
            </React.Fragment>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

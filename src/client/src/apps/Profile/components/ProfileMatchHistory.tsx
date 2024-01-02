import { Box, Divider, Stack } from '@mui/joy';
import SingleMatchHist from './SingleMatchHist';
import React from 'react';
import ProfileTabHeader from './ProfileTabHeader';

export default function ProfileMatchHistory({ id }: { id?: number }) {
  return (
    <Box overflow="auto" height="100%" width="100%">
      <Stack width="100%" alignItems="center" spacing={1} p={1}>
        <ProfileTabHeader title="Match History" path={`/pong/history/${id ?? 'me'}`} />
        <Stack
          alignItems={'center'}
          justifyContent={'flex-start'}
          spacing={1.5}
          width="100%"
        >
          {[...new Array(10)].map((_, index) => (
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

import { Box, CircularProgress, Divider, Stack, Typography } from '@mui/joy';
import SingleMatchHist from './SingleMatchHist';
import React from 'react';
import ProfileTabHeader from './ProfileTabHeader';
import { useTunnelEndpoint } from '@hooks/tunnel';
import PongHistoryModel from '@typings/models/pong/history';
import TableTennisIcon from '@components/icons/TableTennisIcon';
import GenericPlaceholder from '@components/GenericPlaceholder';

function Entries({ id }: { id?: number }): JSX.Element {
  const { isLoading, error, data } = useTunnelEndpoint<
    | PongHistoryModel.Endpoints.GetAllByUserId
    | PongHistoryModel.Endpoints.GetAllBySession
  >(
    !id
      ? PongHistoryModel.Endpoints.Targets.GetAllBySession
      : PongHistoryModel.Endpoints.Targets.GetAllByUserId,
    !id
      ? { take: 5 }
      : {
          id,
          take: 5,
        }
  );

  return (
    <>
      {isLoading ? (
        <CircularProgress variant="plain" />
      ) : error || !data ? (
        <Typography color="danger" level="title-md">
          {error?.toString() ?? 'No data found'}
        </Typography>
      ) : data.length > 0 ? (
        <Stack
          alignItems={'center'}
          justifyContent={'flex-start'}
          spacing={1.5}
          width="100%"
          overflow="none"
        >
          {data.map((match, index) => (
            <React.Fragment key={index}>
              <SingleMatchHist {...match} profileId={id} />
              {index !== data.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Stack>
      ) : (
        <GenericPlaceholder
          label="Play a Match"
          title="No Matches Found"
          icon={<TableTennisIcon fontSize="xl4" />}
          path="/pong/play/queue"
        />
      )}
    </>
  );
}

export default function ProfileMatchHistory({
  id,
  isBot = false,
}: {
  id?: number;
  isBot?: boolean;
}) {
  return (
    <Box overflow="auto" height="100%" width="100%">
      <Box
        display="flex"
        width="100%"
        height="100%"
        flexDirection="column"
        alignItems="center"
        gap={1}
        p={1}
        overflow="none"
      >
        <ProfileTabHeader
          title="Match History"
          path={`/pong/history/${id ?? 'me'}`}
        />
        {isBot ? (
          <GenericPlaceholder
            title="No Matches Found"
            icon={<TableTennisIcon fontSize="xl4" />}
            path="/pong/play/queue"
          />
        ) : (
          <Entries id={id} />
        )}
      </Box>
    </Box>
  );
}

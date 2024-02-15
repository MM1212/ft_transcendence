import {
  Box,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/joy';
import SingleMatchHist from './SingleMatchHist';
import React from 'react';
import ProfileTabHeader from './ProfileTabHeader';
import { useTunnelEndpoint } from '@hooks/tunnel';
import PongHistoryModel from '@typings/models/pong/history';
import TableTennisIcon from '@components/icons/TableTennisIcon';
import GenericPlaceholder from '@components/GenericPlaceholder';
import { Link } from 'wouter';

export default function ProfileMatchHistory({ id }: { id?: number }) {
  const { isLoading, error, data, isValidating } = useTunnelEndpoint<
    | PongHistoryModel.Endpoints.GetAllByUserId
    | PongHistoryModel.Endpoints.GetAllBySession
  >(
    !id
      ? PongHistoryModel.Endpoints.Targets.GetAllBySession
      : PongHistoryModel.Endpoints.Targets.GetAllByUserId,
    !id
      ? undefined
      : {
          id,
        }
  );
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
        {isLoading || isValidating ? (
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
            {data.slice(0, 5).map((match, index) => (
              <React.Fragment key={index}>
                <SingleMatchHist {...match} profileId={id} />
                {index !== 4 && <Divider />}
              </React.Fragment>
            ))}
            {data.length > 5 && (
              <Typography component={Link} to={`/pong/history/${id ?? 'me'}`}>
                ...See Full Match History
              </Typography>
            )}
          </Stack>
        ) : (
          <GenericPlaceholder
            label="Play a Match"
            title="No Matches Found"
            icon={<TableTennisIcon fontSize="xl4" />}
            path="/pong/play/queue"
          />
        )}
      </Box>
    </Box>
  );
}

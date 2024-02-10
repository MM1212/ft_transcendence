import GenericPlaceholder from '@components/GenericPlaceholder';
import BugIcon from '@components/icons/BugIcon';
import { useTunnelEndpoint } from '@hooks/tunnel';
import { CircularProgress, Grid } from '@mui/joy';
import LeaderboardModel from '@typings/models/leaderboard';
import LeaderBoardUser from './LeaderBoardUser';
import TableTennisIcon from '@components/icons/TableTennisIcon';
import React from 'react';

export default function LeaderboardEntries(): JSX.Element {
  const { data, isLoading, error, isValidating } =
    useTunnelEndpoint<LeaderboardModel.Endpoints.GetLeaderboard>(
      LeaderboardModel.Endpoints.Targets.GetLeaderboard
    );

  if (isLoading || isValidating) return <CircularProgress variant="plain" />;
  if (error || !data)
    return (
      <GenericPlaceholder
        title={`There was an error loading the leaderboard`}
        label={error ?? 'Unknown error'}
        icon={<BugIcon fontSize="xl4" />}
      />
    );
  if (data.length === 0)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <GenericPlaceholder
          title="No rankings available yet"
          icon={<TableTennisIcon fontSize="xl4" />}
          label="Play a Match"
          path="/pong/play/queue"
        />
      </div>
    );
  return (
    <Grid
      xs={12}
      container
      rowGap={2}
      width="100%"
      flexDirection="column"
      flexGrow={1}
      overflow="hidden auto"
    >
      {data?.map((entry, idx) => (
        <React.Suspense key={entry.id}>
          <LeaderBoardUser {...entry} position={entry.position ?? idx + 1} />
        </React.Suspense>
      ))}
    </Grid>
  );
}

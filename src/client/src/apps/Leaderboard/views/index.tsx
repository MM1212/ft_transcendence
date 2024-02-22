import { Divider, Grid, Sheet } from '@mui/joy';
import LobbyGameTypography from '@apps/GameLobby/components/LobbyGameTypography';
import LeaderboardEntries from '../components/LeaderboardEntries';
import LeaderBoardHeader from '../components/LeaderboardHeader';

export default function LeaderBoard() {
  return (
    <Sheet
      sx={{
        width: '80dvh',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}
    >
      <Grid container spacing={2} direction="column" width="100%" height="100%">
        <Grid xs={12}>
          <LobbyGameTypography level="body-lg">Leaderboard</LobbyGameTypography>
        </Grid>
        <Grid xs={12}>
          <Divider />
        </Grid>
        <Grid xs={12}>
          <LeaderBoardHeader />
        </Grid>
        <Grid xs={12} flexGrow={1}>
          <LeaderboardEntries />
        </Grid>
      </Grid>
    </Sheet>
  );
}

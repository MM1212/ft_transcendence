import LobbyGameTypography from '@apps/GameLobby/components/LobbyGameTypography';
import { Sheet } from '@mui/joy';
import React from 'react';
import Grid from '@mui/joy/Grid';
import MedalIcon from '@components/icons/MedalIcon';
import AccountIcon from '@components/icons/AccountIcon';
import ChevronTripleUpIcon from '@components/icons/ChevronTripleUpIcon';
import PercentIcon from '@components/icons/PercentIcon';

const _LeaderBoardHeader = function LeaderBoardHeader(): JSX.Element {
  return (
    <Sheet
      component={Grid}
      sx={{
        width: '100%',
        flexGrow: 1,
      }}
      container
      rowSpacing={4}
    >
      <Grid xs={2} alignItems="center">
        <LobbyGameTypography
          style={{
            justifySelf: 'left',
          }}
          level="body-md"
          startDecorator={<MedalIcon />}
        >
          Rank
        </LobbyGameTypography>
      </Grid>
      <Grid xs={5} alignItems="center">
        <LobbyGameTypography
          style={{
            justifySelf: 'left',
          }}
          level="body-md"
          startDecorator={<AccountIcon />}
        >
          Player
        </LobbyGameTypography>
      </Grid>
      <Grid xs={2} alignItems="center">
        <LobbyGameTypography
          style={{
            justifySelf: 'left',
          }}
          startDecorator={<ChevronTripleUpIcon />}
          level="body-md"
        >
          Rating
        </LobbyGameTypography>
      </Grid>
      <Grid container xs={3} alignItems="center" justifyContent="flex-end">
        <LobbyGameTypography
          startDecorator={<PercentIcon />}
          level="body-md"
        >
          Win Rate
        </LobbyGameTypography>
      </Grid>
    </Sheet>
  );
};

const LeaderBoardHeader = React.memo(_LeaderBoardHeader);

export default LeaderBoardHeader;

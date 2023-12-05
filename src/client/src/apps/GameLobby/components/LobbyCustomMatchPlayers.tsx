import { Box, Typography } from '@mui/joy';
import { Stack } from '@mui/joy';
import LobbyPlayerPlaceholder from './LobbyPlayerPlacehoder';
import LobbyGameTypography from './LobbyGameTypography';
import PongModel from '@typings/models/pong';

export default function LobbbyCustomMatchPlayers({
  leftTeam,
  rightTeam,
}: {
  leftTeam: PongModel.Models.ITeam;
  rightTeam: PongModel.Models.ITeam;
}) {
  return (
    <>
      <Stack
        sx={{
          flexDirection: 'row',
          display: 'flex',
          width: '100%',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
          }}
        >
          <LobbyGameTypography sx={{ mb: 2, border: 'unset' }} level="title-lg">
            Team 1
          </LobbyGameTypography>
          <LobbyPlayerPlaceholder id={leftTeam.players[0]?.id} position={2} />
          <LobbyPlayerPlaceholder id={leftTeam.players[1]?.id} position={2} />
        </Box>
        <Box sx={{ width: '20%' }}></Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'left',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
          }}
        >
          <LobbyGameTypography sx={{ mb: 2, border: 'unset' }} level="title-lg">
            Team 2
          </LobbyGameTypography>
          <LobbyPlayerPlaceholder id={rightTeam.players[0]?.id} position={2} />
          <LobbyPlayerPlaceholder id={rightTeam.players[1]?.id} position={2} />
        </Box>
      </Stack>
    </>
  );
}

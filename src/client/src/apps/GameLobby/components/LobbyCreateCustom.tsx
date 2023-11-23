import { Box, Sheet } from '@mui/joy';
import LobbyPlayerPlaceholder from './LobbyPlayerPlacehoder';
import { Stack } from '@mui/joy';
import publicPath from '@utils/public';

export default function LobbyCreateCustom() {
  return (
    <Sheet
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        backgroundColor: 'unset',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          pb: '100px',
        }}
      >
        <img src={publicPath('/matchMaking/CustomPick.webp')}></img>
      </Box>
      <Stack
        sx={{
          flexDirection: 'row',
          display: 'flex',
        }}
      >
        <Box
          sx={{
            width: '40%',
            height: '100%',
          }}
        >
          <LobbyPlayerPlaceholder id={1} />
          <LobbyPlayerPlaceholder id={2} />
        </Box>
        <Box sx={{ width: '20%' }}></Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'left',
            flexDirection: 'column',
            width: '40%',
            height: '100%',
          }}
        >
          <LobbyPlayerPlaceholder id={3} />
          <LobbyPlayerPlaceholder id={8} />
        </Box>
      </Stack>
    </Sheet>
  );
}

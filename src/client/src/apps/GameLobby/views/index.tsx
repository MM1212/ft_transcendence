import { Sheet } from '@mui/joy';
import publicPath from '@utils/public';
import LobbyPongTabs from '../components/LobbyPongTabs';
// Define your customizations and components

// Use LobbyTop component with your customizations and components

export default function GameLobby() {
  return (
    <Sheet
      sx={{
        width: '100dvh',
        height: '100%',
        backgroundImage: `url(${publicPath(
          '/matchMaking/backgroundLobby.webp'
        )})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <LobbyPongTabs />
    </Sheet>
  );
}

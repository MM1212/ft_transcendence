import { Sheet } from '@mui/joy';
import publicPath from '@utils/public';
import LobbyPongTabs from '../components/LobbyPongTabs';
// Define your customizations and components

// Use LobbyTop component with your customizations and components

export default function GameLobby() {
  return (
    <Sheet
      sx={{
        width: '80dvh',
        height: '100%',
      }}
    >
      <img
        src={publicPath('/loginPage.webp')}
        alt="background"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(4px)',
          opacity: 0.25,
        }}
      />
      <LobbyPongTabs />
    </Sheet>
  );
}

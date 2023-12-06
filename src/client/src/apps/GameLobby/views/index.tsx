import { Divider } from "@mui/joy";
import { Sheet } from "@mui/joy";
import publicPath from "@utils/public";
import { LobbyMatchMaking } from "../components/LobbyMatchMaking";
import LobbyCreateCustom from "../components/LobbyCreateCustom";
import LobbyPongTabs from "../components/LobbyPongTabs";
import LobbyJoinCustom from "../components/LobbyJoinCustom";
// Define your customizations and components
const label = ["Matchmaking", "Create Custom", "Join Custom"];
const components = [<LobbyMatchMaking key={0} />, <LobbyCreateCustom key={2} />, <LobbyJoinCustom key={3}/>];

// Use LobbyTop component with your customizations and components

export default function GameLobby() {
  return (
    <Sheet
      sx={{
        width: "90dvh",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundImage: `url(${publicPath('/matchMaking/backgroundLobby.webp')})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <LobbyPongTabs tabLabel={label} reactComponents={components} />
    </Sheet>
  );
}

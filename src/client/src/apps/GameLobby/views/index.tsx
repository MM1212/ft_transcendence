import { Card, CardContent, CardCover, Divider } from "@mui/joy";
import LobbyTop from "../components/LobbyTop";
import { Sheet } from "@mui/joy";
import publicPath from "@utils/public";

export default function GameLobby() {
  return (
    <Sheet
      sx={{
        width: "80dvh",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundImage: `url(${publicPath('/matchMaking/backgroundLobby.jpg')})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <LobbyTop/>
      <Divider orientation="horizontal" />
    </Sheet>
  );
}

import { Card, CardContent, CardCover, Divider, Sheet } from "@mui/joy";
import backgroundQueue from "../assets/backgroundQueue.jpg";
import backgroundLobby from "../assets/backgroundLobby.jpg";
import LobbyTop from "../components/LobbyTop";
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
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <CardContent>
        <LobbyTop></LobbyTop>
      </CardContent>
      <Divider orientation="horizontal" />
      {/* <LobbyBottom></LobbyBottom> */}
    </Sheet>
  );
}

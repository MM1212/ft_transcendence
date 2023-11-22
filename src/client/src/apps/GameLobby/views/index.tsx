import { Card, CardContent, CardCover, Divider } from "@mui/joy";
import backgroundQueue from "../assets/backgroundQueue.jpg";
import backgroundLobby from "../assets/backgroundLobby.jpg";
import LobbyTop from "../components/LobbyTop";

export default function GameLobby() {
  return (
    <Card
      sx={{
        width: "80dvh",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <CardContent>
        <LobbyTop></LobbyTop>
      </CardContent>
      <Divider orientation="horizontal" />
      {/* <LobbyBottom></LobbyBottom> */}
      <CardCover>
        <img src={backgroundLobby} />
      </CardCover>
    </Card>
  );
}

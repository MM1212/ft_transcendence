import { useCurrentUser } from "@hooks/user";
import {
  Typography,
  styled,
} from "@mui/joy";
import { useState } from "react";
import MatchMakingCounter from "./MatchMakingCounter";
import publicPath from "@utils/public";
import { UserAvatar } from "@components/AvatarWithStatus";

const FindMatchWrapper = styled("div")(({ theme }) => ({
  "& > img": {
    transition: theme.transitions.create("filter", {
      duration: theme.transitions.duration.shortest,
    }),
    pointerEvents: "none",
  },
  "& > span": {
    pointerEvents: "none",
  },
  "&:hover": {
    cursor: "pointer",
    "& > img": {
      filter: "brightness(1.15)",
    },
  },
}));

export function LobbyMatchMaking() {
  const [isMatchmakingStarted, setIsMatchmakingStarted] = useState(false);
  const user = useCurrentUser();

  const handleStartMatchmaking = () => {
    if (!isMatchmakingStarted) setIsMatchmakingStarted(true);
    else setIsMatchmakingStarted(false);
  };

  if (user === null) return;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "3dvh",
          position: "relative",
        }}
      >
        <UserAvatar
          sx={(theme) => ({
            width: theme.spacing(17),
            height: theme.spacing(17),
            position: "absolute",
            marginTop: "7dvh",
            zIndex: 1,
          })}
          variant="outlined"
          src={user?.avatar}
        />
          <Typography textAlign='center' sx={{position:'absolute', bottom: '50%'}} >{user.nickname}</Typography>
        <img
          src={publicPath("/matchMaking/matchMakingFrame.webp")}
          alt="Matchmaking Frame"
          width="300"
          height="500"
        /> 
        <div
          style={{
            position: "absolute",
            display: 'flex',
            flexDirection: 'column',
            marginTop: "auto",
            bottom: "15%",
          }}
          >
          <img
            src={publicPath("/matchMaking/paddleFrame.webp")}
            alt="Matchmaking Frame"
            width="200"
            height="50"
          ></img>
          <img
            src={publicPath("/matchMaking/powerFrame.webp")}
            alt="Matchmaking Frame"
            width="70"
            height="70"
          ></img>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "10dvh",
        }}
      >
        {isMatchmakingStarted && (
          <MatchMakingCounter stop={handleStartMatchmaking} />
        )}
        {!isMatchmakingStarted && (
          <FindMatchWrapper
            sx={{
              position: "relative",
            }}
            onClick={handleStartMatchmaking}
          >
            <img
              src={publicPath("/matchMaking/button1.webp")}
              alt="Matchmaking Frame"
              width="200" // Specify the desired width
              height="70" // Specify the desired height
            />
            <Typography
              component="span"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontWeight: "bold",
                fontFamily: "chivo",
                fontSize: "0.9rem",
              }}
              textTransform="uppercase"
            >
              Find Match
            </Typography>
          </FindMatchWrapper>
        )}
      </div>
    </div>
  );
}

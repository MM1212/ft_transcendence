import { useCurrentUser } from '@hooks/user';
import { styled } from '@mui/joy';
import { useState } from 'react';
import MatchMakingCounter from './MatchMakingCounter';
import LobbyPongButton from './LobbyPongBottom';
import LobbyPlayerBanner from './LobbyPlayerBanner';
import tunnel from '@lib/tunnel';
import PongModel from '@typings/models/pong';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import pongGamesState from '../state';
import { OpenGameModal } from '@apps/GamePong/PongModal';

export const FindMatchWrapper = styled("div")(({ theme }) => ({
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
  const isPlaying = useRecoilValue(pongGamesState.isPlaying);
  const lobby = useRecoilValue(pongGamesState.gameLobby)!;
  const user = useCurrentUser();
  const [isLobbyActive, setIsLobbyActive] = useState(false);

  const handleStartMatchmaking = useRecoilCallback(
    (ctx) => async () => {
      if (!isMatchmakingStarted) setIsMatchmakingStarted(true);
      else  setIsMatchmakingStarted(false);
      try {
         let lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
        if (!lobby) {
          lobby = await tunnel.put(PongModel.Endpoints.Targets.NewLobby, {
            password: null,
            name: user!.nickname,
            spectators: PongModel.Models.LobbySpectatorVisibility.All,
            lobbyType: PongModel.Models.LobbyType.Single,
            gameType: PongModel.Models.LobbyGameType.Powers,
            lobbyAccess: PongModel.Models.LobbyAccess.Private,
            score: 7,
          });
          ctx.set(pongGamesState.gameLobby, lobby);
          console.log("newLobby");

          await tunnel.put(PongModel.Endpoints.Targets.AddToQueue, {
            lobbyId: lobby.id,
          });
        }
      } catch {
        console.log("error in: create lobby and add to queue");
      }
    },
    [isMatchmakingStarted, user]
  );
  
  // const handleInviteList = useRecoilCallback(
  //   (ctx) => async () => {
  //     setIsLobbyActive(true); 
  //     try {
  //       let lobby = await ctx.snapshot.getPromise(pongGamesState.gameLobby);
  //       if (!lobby) {
  //         lobby = await tunnel.put(PongModel.Endpoints.Targets.NewLobby, {
  //           password: null,
  //           name: user!.nickname,
  //           spectators: PongModel.Models.LobbySpectatorVisibility.None,
  //           lobbyType: PongModel.Models.LobbyType.Double,
  //           gameType: PongModel.Models.LobbyGameType.Powers,
  //           lobbyAccess: PongModel.Models.LobbyAccess.Private,
  //           score: 7,
  //         });
  //         ctx.set(pongGamesState.gameLobby, lobby);
  //         console.log("newLobby");
  //         try {
  //           const selected = await selectInvites({
  //             body: "Invite to Lobby",
  //             includeDMs: true,
  //             multiple: true,
  //             exclude: lobby.teams[0].players
  //             .concat(lobby.teams[1].players)
  //             .concat(lobby.spectators)
  //             .map<ChatSelectedData>((player) => ({
  //               type: "user",
  //               id: player.id,
  //             }))
  //             .concat(
  //               lobby.invited.map<ChatSelectedData>((id) => ({
  //                 type: "user",
  //                 id,
  //               }))
  //             ),
  //         });
  //           if (selected.length === 0) return;
  //           await tunnel.post(PongModel.Endpoints.Targets.Invite, {
  //             lobbyId: lobby.id,
  //             data: selected,
  //             source: PongModel.Models.InviteSource.Lobby,
  //           });
  //         } catch {
  //           console.log("error in: create lobby and add to queue");
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //     console.log("Lobby 2:" + lobby)
  //   },
  //   [user, selectInvites, setIsLobbyActive, lobby]
  // );
  
  // const handleLeaveLobby = useRecoilCallback((ctx) => async () => {
  //   const notif = notifications.default("Leaving lobby...");
  //   setIsLobbyActive(false);
  //   try {
  //     const payload = {
  //       lobbyId: lobby.id,
  //     };
  //     await tunnel.put(PongModel.Endpoints.Targets.LeaveLobby, payload);
  //     notif.update({
  //       message: "Left lobby successfully!",
  //       color: "success",
  //     });
  //     ctx.set(pongGamesState.gameLobby, null);
  //     console.log(pongGamesState.gameLobby);
  //   } catch (error) {
  //     notifications.error("Failed to leave lobby", (error as Error).message);
  //   }
  // });
  console.log(lobby);
  if (user === null) return;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100%",
          width: "100%",
          justifyContent: "space-evenly",
        }}
      >
        <LobbyPlayerBanner id={user.id} />
        {isLobbyActive  ? (
          <LobbyPlayerBanner id={user.id} />
        ) : (
          <LobbyPlayerBanner id={undefined} />
          // <Button onClick={handleInviteList} > Invite PLayers</Button>
        )}
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
            <LobbyPongButton label="Find Match" />
          </FindMatchWrapper>
        )}
          <OpenGameModal isPlaying={isPlaying} />
        {/* <Button onClick={handleLeaveLobby}>Leave Lobby</Button> */}
      </div>
    </div>
  );
}

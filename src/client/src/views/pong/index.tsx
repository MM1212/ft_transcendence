import { useSocket } from "@hooks/socket";
import { buildTunnelEndpoint } from "@hooks/tunnel";
import PongModel from "@typings/models/pong";
import * as PIXI from "pixi.js";
import { UIGame } from "./Game";
import React from "react";
import {
  ETeamSide,
  IGameConfig,
  IPlayerConfig,
} from "@shared/Pong/config/configInterface";
import { Input } from "@mui/joy";

// add textures
const Targets = PongModel.Endpoints.Targets;
const buildTexture = (target: PongModel.Endpoints.Targets) =>
  PIXI.Texture.from(target);

export const P1Tex = buildTexture(Targets.PaddleTexture1);
export const P2Tex = buildTexture(Targets.PaddleTexture1);
export const BallTex = buildTexture(Targets.BallTexture1);
export const BubbleTex = buildTexture(Targets.PowerWaterTexture);
export const IceTex = buildTexture(Targets.PowerIceTexture);
export const SparkTex = buildTexture(Targets.PowerSparkTexture);
export const CannonTex = buildTexture(Targets.PowerCannonTexture);
export const MarioBoxTex = buildTexture(Targets.MarioBoxTexture);
export const GhostTex = buildTexture(Targets.PowerGhostTexture);

//export const FireAnim = new Promise<PIXI.Texture[]>((resolve) => {
//  const FireballFolderPath = buildTunnelEndpoint(Targets.FireballAnimDict);
//
//  const FireballAnimation = [...new Array(4)].map((_, i) => ({
//    path: `${FireballFolderPath}/Fireball_${i.toString().padStart(3, "0")}.png`,
//    id: `Fireball_${i.toString().padStart(3, "0")}.png`,
//  }));
//
//  FireballAnimation.forEach((path) =>
//    PIXI.Assets.add({
//      alias: path.id,
//      src: path.path,
//    })
//  );
//  PIXI.Assets.load(FireballAnimation.map((anim) => anim.id)).then(
//    (textures) => {
//      console.log(textures);
//      resolve(Object.values(textures));
//    }
//  );
//}).catch(console.error);

export const ARENA_SIZE = 50;
export const DEFAULT_LINE_COLOR = 0xffffff;
export const DEFAULT_FIELD_COLOR = 0x000000;
export const P_START_DIST = 40;
export const hue_value = 0;

export const defaultPlayerConfig: IPlayerConfig = {
  tag: "",
  teamId: 0,
  type: "player",
  keys: undefined,
  specialPower: "Spark",
  paddleTexture: Targets.PaddleTexture1,
  paddleColor: 0xffffff,
  positionOrder: "back",
  userId: "",
  ready: false,
  connected: false,
};

export const defaultLeftTeamConfig = {
  id: ETeamSide.Left,
  players: [],
  score: 0,
};
export const defaultRightTeamConfig = {
  id: ETeamSide.Right,
  players: [],
  score: 0,
};

export const defaultGameConfig: IGameConfig = {
  roomId: "",
  teams: [defaultLeftTeamConfig, defaultRightTeamConfig],
  partyOwnerId: "",
  spectators: [],
  backgroundColor: 0x000000,
  lineColor: 0xffffff,
  nPlayers: 0,
};

const playerTestConfig1: IPlayerConfig = {
  tag: "Player1", // needs to be done in server
  teamId: 0,
  type: "player",
  keys: undefined,
  specialPower: "Spark",
  paddleTexture: Targets.PaddleTexture1,
  paddleColor: 0xffffff,
  positionOrder: "back",
  userId: "",
  ready: false,
  connected: false,
};

const playerTestConfig2: IPlayerConfig = {
  tag: "Player2",
  teamId: 0,
  type: "player",
  keys: undefined,
  specialPower: "Spark",
  paddleTexture: Targets.PaddleTexture1,
  paddleColor: 0xffffff,
  positionOrder: "back",
  userId: "",
  ready: false,
  connected: false,
};

export default function Pong() {
  const { connected, socket, status, useMounter, emit, useListener } =
    useSocket(buildTunnelEndpoint(Targets.Connect));

  /*
    Start with a game config initialized with the default values of the player's config
    and default values of the game config.
    
    gameConfig = { lineColor , backgroundColor, ballColor, ... }
    myPlayerConfig = { paddlesTexture, paddleColor, specialPower, ...}
    
    And update it everytime a player does something (join, leave, ready, ...) 

    For this i need to have a config to show me the current "status" of all players in the lobby,
    It will use each player's config on create and will use the config that already exists
      if the player joins the game.
    
    When the Start button is pressed the config will be sent to the server and the game will be created
      with the config.
    
    When everyone is done loading the game with the config sent from the server, the game will start.

    For updating the config file i will use react's useState hook to update the config file when the 
     player does something. 
       
       [ Change occurs ] -> [ Action will be sent to server ] -> [ Server will update the config file ] 
       -> [ Server will send the updated config file to all players ] -> [ Lobby will be updated 
          with the config file sent from the server using React's useState ]
  */

  useMounter();

  const [game, setGame] = React.useState<UIGame | null>(null);

  const [gameConfig, setGameConfig] =
    React.useState<IGameConfig>(defaultGameConfig);
  
  const getPlayerConfig = (gameConfig: IGameConfig, socketId: string): IPlayerConfig | undefined => {
    for (const team of gameConfig.teams) {
      const player = team.players.find((player: IPlayerConfig) => player.userId === socketId);
      if (player) {
        return player;
      }
    }
    return undefined;
  };

  // this one will be used when changing anything colorwise
  const [myPlayerConfig, setMyPlayerConfig] =
    React.useState<IPlayerConfig>(defaultPlayerConfig);

  const [input, setInput] = React.useState<string>("1");

  const parentRef = React.useRef<HTMLDivElement>(null);

  const createRoom = React.useCallback(() => {
    socket.emit("create-room", {game: gameConfig, player: myPlayerConfig});
    socket.once(
      "create-room",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          setGameConfig(data);
          const newPlayerConf = getPlayerConfig(data, socket.id);
          if (newPlayerConf) setMyPlayerConfig(newPlayerConf);
          console.log(data);
        }
      }
    );
  }, [socket, gameConfig, myPlayerConfig, setGameConfig, setMyPlayerConfig]);

  const joinRoom = React.useCallback(() => {
    socket.emit("join-room", {roomId: input, player: myPlayerConfig});
    socket.once("join-room", (error: string, data: IGameConfig | undefined) => {
      if (!parentRef.current) return;
      if (data == undefined) {
        alert(error);
      } else {
        setGameConfig(data);
        const newPlayerConf = getPlayerConfig(data, socket.id);
        if (newPlayerConf) setMyPlayerConfig(newPlayerConf);
      }
    });
  }, [socket, input, myPlayerConfig, setGameConfig, setMyPlayerConfig]);

  const readyPlayer = React.useCallback(() => {
    socket.emit("ready-player", input);
    socket.once(
      "ready-player",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          setGameConfig(data);
          console.log(data);
          console.log("READY");
        }
      }
    );
  }, [socket, input]);

  const getRooms = React.useCallback(() => {
    socket.emit("get-rooms");
    socket.once("get-rooms", (error: string, rooms: string[] | undefined) => {
      if (rooms == undefined) {
        alert(error);
      } else {
        console.log(rooms);
      }
    });
  }, [socket]);

  const leaveRoom = React.useCallback(() => {
    socket.emit("leave-room", input);
    socket.once(
      "leave-room",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          if (game) {
            game.shutdown();
            setGame(null);
          } 
          else if (data !== defaultGameConfig) 
            setGameConfig(defaultGameConfig);
        }
      }
    );
  }, [socket, game, input]);

  const switchPosition = React.useCallback(() => {
    socket.emit("switch-position", input);
    socket.once(
      "switch-position",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          setGameConfig(data);
        }
      }
    );
  }, [socket, input]);

  const startGame = React.useCallback(() => {
    socket.emit("start-game");
    socket.once(
      "start-game",
      (error: string, data: IGameConfig | undefined) => {
        if (!parentRef.current) return;
        if (data == undefined) {
          alert(error);
        } else {
          const game = new UIGame(socket, parentRef.current, data);
          setGame(game);

          console.log("START");
        }
      }
    );
  }, [socket, parentRef]);

  const refreshRoom = React.useCallback(() => {
    socket.emit("refresh-room", input);
    socket.once(
      "refresh-room",
      (error: string, data: IGameConfig | undefined) => {
        if (data == undefined) {
          alert(error);
        } else {
          setGameConfig(data);
        }
      }
    );
  }, [socket, input]);

  //React.useEffect(() => {
  //  const handler = (rooms: string[]) => {
  //    console.log(rooms);
  //  };
  //  socket.on("getRooms", handler);
  //  return () => void socket.off("getRooms", handler);
  //}, [socket]);

  // TODO: display active room
  return (
    <div ref={parentRef}>
      <h1>Pong {`${game?.socket.connected}`}</h1>
      <h1>My Id: {`${socket.id}`}</h1>
      <h1>Room: {`${gameConfig.roomId}`}</h1>
      <h2>Party Owner: {`${gameConfig.partyOwnerId}`}</h2>
      <h1>Team 1:</h1>
      <h3>P1: {`${gameConfig?.teams[0]?.players[0]?.userId}`} || Ready:{`${gameConfig?.teams[0]?.players[0]?.ready}`}</h3>
      <h3>P2: {`${gameConfig?.teams[0]?.players[1]?.userId}`} || Ready:{`${gameConfig?.teams[0]?.players[1]?.ready}`}</h3>
      <h1>Team 2</h1>
      <h3>P1: {`${gameConfig?.teams[1]?.players[0]?.userId}`} || Ready:{`${gameConfig?.teams[1]?.players[0]?.ready}`}</h3>
      <h3>P2: {`${gameConfig?.teams[1]?.players[1]?.userId}`} || Ready:{`${gameConfig?.teams[1]?.players[1]?.ready}`}</h3>

      <Input value={input} onChange={(event) => setInput(event.target.value)} />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: "50%",
          gap: ".2rem",
        }}
      >
        <button onClick={createRoom}>Create Room</button>
        <button onClick={joinRoom}>Join Room</button>
        <button onClick={readyPlayer}>Ready</button>
        <button onClick={leaveRoom}>Leave room</button>
        <button onClick={getRooms}>Get Rooms</button>
        <button onClick={startGame}>START</button>
        <button onClick={refreshRoom}>REFRESH</button>
        <button onClick={switchPosition}>Switch Position</button>

        <button>Switch Party Owner</button>
        <button>Switch Team</button>
        <button>Change Paddle Color</button>
        <button>STOP</button>
      </div>
    </div>
  );
}

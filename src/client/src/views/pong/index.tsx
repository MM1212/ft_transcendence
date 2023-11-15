import { useSocket } from "@hooks/socket";
import { buildTunnelEndpoint } from "@hooks/tunnel";
import PongModel from "@typings/models/pong";
import * as PIXI from "pixi.js";
import { UIGame, socket } from "./Game";
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
  PIXI.Texture.from(buildTunnelEndpoint(target));

export const P1Tex = buildTexture(Targets.PaddleTexture1);
export const P2Tex = buildTexture(Targets.PaddleTexture1);
export const BallTex = buildTexture(Targets.BallTexture1);
export const BubbleTex = buildTexture(Targets.PowerWaterTexture);
export const IceTex = buildTexture(Targets.PowerIceTexture);
export const SparkTex = buildTexture(Targets.PowerSparkTexture);
export const CannonTex = buildTexture(Targets.PowerCannonTexture);
export const MarioBoxTex = buildTexture(Targets.MarioBoxTexture);
export const GhostTex = buildTexture(Targets.PowerGhostTexture);

export const FireAnim = new Promise<PIXI.Texture[]>((resolve) => {
  const FireballFolderPath = buildTunnelEndpoint(Targets.FireballAnimDict);

  const FireballAnimation = [...new Array(4)].map((_, i) => ({
    path: `${FireballFolderPath}/Fireball_${i.toString().padStart(3, "0")}.png`,
    id: `Fireball_${i.toString().padStart(3, "0")}.png`,
  }));

  FireballAnimation.forEach((path) =>
    PIXI.Assets.add({
      alias: path.id,
      src: path.path,
    })
  );
  PIXI.Assets.load(FireballAnimation.map((anim) => anim.id)).then(
    (textures) => {
      console.log(textures);
      resolve(Object.values(textures));
    }
  );
}).catch(console.error);

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
  userId: undefined,
  ready: false,
  connected: false,
};

export const defaultGameConfig: IGameConfig = {
  roomId: "",
  teams: [
    {
      id: ETeamSide.Left,
      players: [],
      score: 0,
    },
    {
      id: ETeamSide.Right,
      players: [],
      score: 0,
    },
  ],
  partyOwner: 0,
  spectators: [],
  backgroundColor: 0x000000,
  lineColor: 0xffffff,
  nPlayers: 0,
};

export const defaultTeamConfig = {
  id: ETeamSide.Left,
  players: [],
  score: 0,
};

export default function Pong() {
  const { connected, socket, status, useMounter, emit, useListener } =
    useSocket(buildTunnelEndpoint(Targets.Connect));
  const [game, setGame] = React.useState<UIGame | null>(null);

  useMounter();

  const [input, setInput] = React.useState<string>("1");
  const [names, setNames] = React.useState<string[]>([]);

  const createRoom = React.useCallback(() => {
    socket.emit("create-game", defaultGameConfig);
    socket.once("join-room", (error: string, data: IGameConfig | undefined) => {
      console.log(data);
      if (data == undefined) {
        alert(error)
      } else {
        const game = new UIGame(socket);
        const gameconfig = data;
        // | Game has to be loaded with game config
        // |  instead of whats below
        setGame(game);
        setNames((prev) => [...prev, socket.id]);
      }
    })
  }, [socket]);

  const joinRoom = React.useCallback(() => {
    socket.emit("join-game", input);
    socket.once("join-room", (error: string, data: IGameConfig | undefined) => {
      if (data == undefined) {
        alert(error)
      } else {
        const game = new UIGame(socket);
        const gameconfig = data;
        // | Game has to be loaded with data: game config
        // |  instead of whats below
        setGame(game);
        setNames((prev) => [...prev, socket.id]);
      }
    });
  }, [socket, input]);

  const readyPlayer = React.useCallback(() => {
    socket.emit("ready-player", input);
    socket.once("ready-change", (error: string, data: IGameConfig | undefined) => {
      if (data == undefined) {
        alert(error)
      } else {
        // change from ready to not ready icon
        console.log("READY");
      }
    });
    
  }, [socket, input])


  const getRooms = React.useCallback(() => {
    socket.emit("get-rooms");
    socket.once("all-rooms", (error: string, rooms: string[] | undefined) => {
      if (rooms == undefined) {
        alert(error)
      } else {
        console.log(rooms);
      }
    });
  }, [socket]);

  const leaveRoom = React.useCallback(() => {
    socket.emit("leave-game", input);
    socket.once("leave-room", (error: string, data: IGameConfig | undefined) => {
      if (data == undefined) {
        alert(error)
      } else {
        // | Game has to be unloaded
        // |  setGame(null);
        game?.shutdown();
        setGame(null);
        setNames([]);
      }
    });
  }, [socket, game, input]);  

  //React.useEffect(() => {
  //  const handler = (rooms: string[]) => {
  //    console.log(rooms);
  //  };
  //  socket.on("getRooms", handler);
  //  return () => void socket.off("getRooms", handler);
  //}, [socket]);

  // TODO: display active room
  return (
    <div>
      <h1>Pong {`${game?.socket.connected}`}</h1>
      <h1>
        team 1: {names[0]} {names[2]}
      </h1>
      <h1>
        team 2: {names[1]} {names[3]}
      </h1>
      <Input value={input} onChange={(event) => setInput(event.target.value)} />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: '50%',
          gap: '.2rem',
        }}
      >
        <button onClick={createRoom}>Create Room</button>
        <button onClick={joinRoom}>Join Room</button>
        <button onClick={readyPlayer}>Ready</button>
        <button onClick={leaveRoom}>Leave game</button>
        <button onClick={getRooms}>Get Rooms</button>
        <button>START</button>
      </div>
    </div>
  );
}

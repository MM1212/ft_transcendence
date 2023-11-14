import { useSocket } from "@hooks/socket";
import { buildTunnelEndpoint } from "@hooks/tunnel";
import PongModel from "@typings/models/pong";
import * as PIXI from "pixi.js";
import { UIGame, socket } from "./Game";
import React from "react";
import { ETeamSide, IGameConfig } from "@shared/Pong/config/configInterface";

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

export default function Pong() {
  const { connected, socket, status, useMounter, emit, useListener } =
    useSocket(buildTunnelEndpoint(Targets.Connect));
  const [game, setGame] = React.useState<UIGame | null>(null);

  useMounter();
  const newRoom = React.useCallback(() => {
    const game = new UIGame(socket);
    setGame(game);
    // TEMPORARY CONFIG
    const gameconfig: IGameConfig = {
      teams: [{
        id: ETeamSide.Left,
        players: [],
        score: 0
      }, {
        id: ETeamSide.Right,
        players: [],
        score: 0
      }],
      partyOwner: 0,
      spectators: [],
      backgroundColor: 0x000000,
      lineColor: 0xffffff,
      nPlayers: 1,
    };

    socket.emit("server-game-create", gameconfig);
  }, [socket]);

  const [names, setNames] = React.useState<string[]>([]);

  return (
    <div>
      <h1>Pong {`${game?.socket.connected}`}</h1>
      {names.map((name: string, idx: number) => (
        <h1 key={idx}>{name}</h1>
      ))}
      <h1>
        team 1: {names[0]} {names[2]}
      </h1>
      <h1>
        team 2: {names[1]} {names[3]}
      </h1>
      <button onClick={newRoom}>criar sala</button>

      <button
        onClick={() => {
          socket.emit("game-readyState", { room: "0", state: true });
        }}
      >
        I am ready
      </button>

      <button
        onClick={() => {
          socket.emit("join-game", { room: "0" });
          setNames((prev) => [...prev, socket.id]);
        }}
      >
        juntar a jogo
      </button>
    </div>
  );
}

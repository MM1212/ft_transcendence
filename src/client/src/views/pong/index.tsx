import { useSocket } from "@hooks/socket";
import { buildTunnelEndpoint } from "@hooks/tunnel";
import PongModel from "@typings/models/pong";
import * as PIXI from "pixi.js";
import { UIGame } from "./Game";
import React from "react";

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
  console.log("loading fireball");

  console.log("loaded fireball");
  const FireballFolderPath = buildTunnelEndpoint(Targets.FireballAnimDict);

  const FireballAnimation = [...new Array(4)].map((_, i) => ({
    path: `${FireballFolderPath}/Fireball_${i.toString().padStart(3, "0")}.png`,
    id: `Fireball_${i.toString().padStart(3, "0")}.png`,
  }));
  console.log(FireballAnimation);
  
  FireballAnimation.forEach((path) => PIXI.Assets.add({
    alias: path.id,
    src: path.path,
  }));
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
  const { connected, status, useMounter, emit, useListener } = useSocket(
    buildTunnelEndpoint(Targets.Connect)
  );

  useMounter();

  React.useEffect(() => {
    // Change screen resolution
    const game = new UIGame(1024, 800);
    game.start();
  }, []);
  return (
    <div>
      <h1>Pong {`${status}`}</h1>
    </div>
  );
}

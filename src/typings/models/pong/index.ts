import { EndpointMethods, Endpoints, GroupEndpointTargets } from "@typings/api";


namespace PongModel {
    export namespace Endpoints {

        export enum Targets {
            Connect = "/pong",
            BallTexture1 = "/pong/Ball.png",
            // BallTexture2 = "",
            MarioBoxTexture = "/pong/MarioBox.png",
            PaddleTexture1 = "/pong/PaddleRed.png",
            // PaddleTexture2 = "",
            PowerWaterTexture = "/pong/PowerWater.png",
            PowerCannonTexture = "/pong/PowerCannon.png",
            PowerIceTexture = "/pong/PowerIce.png",
            PowerSparkTexture = "/pong/PowerSpark.png",
            PowerGhostTexture = "/pong/PowerGhost.png",
            FireballJSON = "/pong/Fireball.json",
            FireballAnimDict = "/pong/Fireball",
        }
        export type All = GroupEndpointTargets<Targets>;
    }

} 

export default PongModel;
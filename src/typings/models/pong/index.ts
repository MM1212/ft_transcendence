import { EndpointMethods, Endpoints, GroupEndpointTargets } from "@typings/api";


namespace PongModel {
    export namespace Endpoints {

        export enum Targets {
            Connect = "/pong",
            BallTexture1 = "/static/pong/Ball.png",
            // BallTexture2 = "",
            MarioBoxTexture = "/static/pong/MarioBox.png",
            PaddleTexture1 = "/static/pong/PaddleRed.png",
            // PaddleTexture2 = "",
            PowerWaterTexture = "/static/pong/PowerWater.png",
            PowerCannonTexture = "/static/pong/PowerCannon.png",
            PowerIceTexture = "/static/pong/PowerIce.png",
            PowerSparkTexture = "/static/pong/PowerSpark.png",
            PowerGhostTexture = "/static/pong/PowerGhost.png",
            FireballJSON = "/static/pong/Fireball.json",
            FireballAnimDict = "/static/pong/Fireball",
        }
        export type All = GroupEndpointTargets<Targets>;
    }

} 

export default PongModel;
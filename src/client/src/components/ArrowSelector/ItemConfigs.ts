import PongModel from '@typings/models/pong';

export const ballsConfig = new Map<string, string>([
  [PongModel.Models.Balls.Red, PongModel.Endpoints.Targets.RedBallTexture],
  [
    PongModel.Models.Balls.FootBall,
    PongModel.Endpoints.Targets.FootBallBallTexture,
  ],
  [PongModel.Models.Balls.Pool, PongModel.Endpoints.Targets.PoolBallTexture],
  [
    PongModel.Models.Balls.Tennis,
    PongModel.Endpoints.Targets.TennisBallTexture,
  ],
  [
    PongModel.Models.Balls.Volley,
    PongModel.Endpoints.Targets.VolleyBallTexture,
  ],
]);

export const specialPConfig = new Map<string, string>([
  [
    PongModel.Models.LobbyParticipantSpecialPowerType.bubble,
    PongModel.Endpoints.Targets.PowerWaterTexture,
  ],
  [
    PongModel.Models.LobbyParticipantSpecialPowerType.fire,
    PongModel.Endpoints.Targets.PowerFireTexture,
  ],
  [
    PongModel.Models.LobbyParticipantSpecialPowerType.ghost,
    PongModel.Endpoints.Targets.PowerGhostTexture,
  ],
  [
    PongModel.Models.LobbyParticipantSpecialPowerType.ice,
    PongModel.Endpoints.Targets.PowerIceTexture,
  ],
  [
    PongModel.Models.LobbyParticipantSpecialPowerType.spark,
    PongModel.Endpoints.Targets.PowerSparkTexture,
  ],
]);

export const paddleConfig = new Map<string, string>([
  [
    PongModel.Models.Paddles.PaddleRed,
    PongModel.Endpoints.Targets.Paddles + '/PaddleRed.webp',
  ],
  [
    PongModel.Models.Paddles.PaddleAcid,
    PongModel.Endpoints.Targets.Paddles + '/PaddleAcid.webp',
  ],
  [
    PongModel.Models.Paddles.PaddleBush,
    PongModel.Endpoints.Targets.Paddles + '/PaddleBush.webp',
  ],
  [
    PongModel.Models.Paddles.PaddleGengar,
    PongModel.Endpoints.Targets.Paddles + '/PaddleGengar.webp',
  ],
  [
    PongModel.Models.Paddles.PaddleMinion,
    PongModel.Endpoints.Targets.Paddles + '/PaddleMinion.webp',
  ],
  [
    PongModel.Models.Paddles.PaddlePenguinBros,
    PongModel.Endpoints.Targets.Paddles + '/PaddlePenguinBros.webp',
  ],
  [
    PongModel.Models.Paddles.PaddleRonaldo,
    PongModel.Endpoints.Targets.Paddles + '/PaddleRonaldo.webp',
  ],
  [
    PongModel.Models.Paddles.PaddleSnake,
    PongModel.Endpoints.Targets.Paddles + '/PaddleSnake.webp',
  ],
  [
    PongModel.Models.Paddles.PaddleWaveColors,
    PongModel.Endpoints.Targets.Paddles + '/PaddleWaveColors.webp',
  ],
  [
    PongModel.Models.Paddles.PaddleRainbow,
    PongModel.Endpoints.Targets.Paddles + '/PaddleWaveColors.webp',
  ],
]);

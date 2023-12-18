import Vector2D from '../Vector/Vector2D';

export const LOBBY_STAGE_SIZE = new Vector2D(2624, 1476);
export const LOBBY_PLAYER_CONTAINER_SCALE = 1.5;
export const LOBBY_TARGET_FPS = 60;
export const IS_CLIENT = typeof window !== 'undefined';
export const IS_SERVER = !IS_CLIENT;

export const P_START_DIST = 40; // Player starting distance from the edge of the canvas
export const MULTIPLAYER_START_POS = 80;
export const ARENA_SIZE = 50;

export const WINDOWSIZE_X = 1024;
export const WINDOWSIZE_Y = 800;

export let backgroundMultiplier: number = 0.00025;
export function setBackgroundMultiplier(value: number) {
    backgroundMultiplier = value;
}
export function getBackgroundMultiplier(): number {
    return backgroundMultiplier;
}

export const StartingBarWidth = 20;
export const StartingBarHeight = 100;

export let hue_value = 0;

export const DEFAULT_LINE_COLOR = 0xffffff;
export const DEFAULT_FIELD_COLOR = 0x000000;

// this is for the powers that the players shoot do not collide with the friendly player
export const multiplayerON = true;

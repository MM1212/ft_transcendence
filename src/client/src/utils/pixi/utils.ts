
import * as PIXI from 'pixi.js';
export const centerObject = (obj: PIXI.Sprite) => {
  obj.anchor.set(0.5);
  obj.position.set(0);
};

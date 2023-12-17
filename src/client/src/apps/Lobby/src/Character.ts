import assetRefCount from '@utils/pixi/AssetRefCount';
import { ClientPlayer } from './Player';
import { Character } from '@shared/Lobby/Character';
import * as PIXI from 'pixi.js';
import { LOBBY_BASE_CHAR_PENGUIN_ASSETS } from './constants';
import { centerObject } from '@utils/pixi/utils';
import animationManager from './AnimationManager';
import { Viewport } from 'pixi-viewport';
import LobbyModel from '@typings/models/lobby';
import assetCache from '@utils/pixi/AssetCache';
import publicPath from '@utils/public';
export class ClientCharacter extends Character {
  public declare readonly player: ClientPlayer;
  private belly: PIXI.AnimatedSprite | null = null;
  private clothTextures: Record<string, PIXI.AnimatedSprite> = {};
  private animatedLayers: PIXI.AnimatedSprite[] = [];

  static colorPalette: LobbyModel.Models.TPenguinColorPalette;
  static clothingPriority: LobbyModel.Models.TPenguinColorPriority;
  constructor(
    clothes: Record<string, number>,
    animation: LobbyModel.Models.IPenguinBaseAnimationsTypes,
    player: ClientPlayer
  ) {
    super(clothes, animation, player);
  }

  private get container(): PIXI.Container {
    return this.player.container;
  }

  private get stage(): Viewport {
    return this.player.lobby.stage;
  }

  private mountName(): void {
    const name = new PIXI.Text(this.player.name, {
      fontFamily: 'monospace',
      dropShadow: true,
      dropShadowDistance: 2,
      dropShadowAngle: 1,
      dropShadowAlpha: 1,
      dropShadowColor: '#000',
      stroke: '#000',
      strokeThickness: 1,
      fontSize: 14,
      align: 'center',
      fill: '#ffffff',
    });

    name.position.set(0, 10);
    name.anchor.set(0.5, -0.5);
    name.zIndex = 999;
    this.container.addChild(name);
  }

  private async getCurrentAnimSet(asset: string): Promise<PIXI.Texture[]> {
    return (await animationManager.compute(asset))[this.animation];
  }

  private async mountPenguin(): Promise<void> {
    await assetRefCount.load(LOBBY_BASE_CHAR_PENGUIN_ASSETS);
    const baseShadow = new PIXI.Sprite(PIXI.Texture.from('base/shadow'));
    baseShadow.name = 'shadow';
    let base: PIXI.Sprite | null = null;
    if (this.player.isMain) {
      base = new PIXI.Sprite(PIXI.Texture.from('base/ring'));
      base.name = 'base';
    }
    this.belly = new PIXI.AnimatedSprite(await this.getCurrentAnimSet('body'));
    await this.updateColor(this.tint);
    this.belly.name = 'body';

    const fixtures = new PIXI.AnimatedSprite(
      await this.getCurrentAnimSet('penguin')
    );
    fixtures.name = 'penguin';

    const clothingPriority = ClientCharacter.clothingPriority;
    const clothingTextures = await Promise.all(
      (Object.keys(this.clothes) as LobbyModel.Models.InventoryCategory[])
        .filter((piece) => this.clothes[piece] !== -1 && piece !== 'color')
        .map(async (piece) => {
          const animSet = await this.getCurrentAnimSet(
            this.clothes[piece].toString()
          );

          const sprite = new PIXI.AnimatedSprite(animSet);
          sprite.name = this.clothes[piece].toString();
          sprite.zIndex = clothingPriority[piece];
          return sprite;
        })
    );
    this.clothTextures = clothingTextures.reduce(
      (acc, curr) => {
        acc[curr.name!] = curr;
        return acc;
      },
      {} as Record<string, PIXI.AnimatedSprite>
    );

    const assets: PIXI.Sprite[] = [
      baseShadow,
      base,
      this.belly,
      fixtures,
    ].filter(Boolean) as PIXI.Sprite[];

    assets.forEach((asset) => {
      centerObject(asset);
      asset.zIndex = -1;
      this.container.addChild(asset);
    });

    clothingTextures.forEach((texture) => {
      centerObject(texture);
      this.container.addChild(texture);
    });

    this.animatedLayers = [this.belly, fixtures, ...clothingTextures];
    this.setupAnimation();
    await this.playAnimation(this.animation);
  }

  async onMount(): Promise<void> {
    await super.onMount();
    if (!ClientCharacter.colorPalette)
      ClientCharacter.colorPalette = (await assetCache.load(
        publicPath('/penguin/color_palette.json')
      ))!;
    if (!ClientCharacter.clothingPriority)
      ClientCharacter.clothingPriority = (await assetCache.load(
        publicPath('/penguin/clothing_prio.json')
      ))!;
    this.mountName();
    await this.mountPenguin();
    if (this.player.isMain) {
      this.stage.scale.set(0.1);
      this.stage.follow(this.container);
    }
  }

  public async updateColor(color: number): Promise<void> {
    if (!this.belly) return;
    this.clothes.color = color;
    this.belly.tint = ClientCharacter.colorPalette[color];
  }

  private setupAnimation(): void {
    const { speed = 0.3, loop = true } = animationManager.getAnimSettings(
      this.animation
    );
    this.animatedLayers.forEach((layer) => {
      layer.animationSpeed = speed;
      layer.loop = loop;
      centerObject(layer);
      layer.gotoAndPlay(0);
    });
  }
  public async playAnimation(
    animation: LobbyModel.Models.IPenguinBaseAnimationsTypes,
    force: boolean = false
  ): Promise<boolean> {
    if (!super.playAnimation(animation, force)) return false;

    await Promise.all(
      this.animatedLayers.map(async (layer) => {
        layer.stop();
        layer.textures = await this.getCurrentAnimSet(layer.name!);
      })
    );

    this.setupAnimation();
    return true;
  }
}

import { Interaction, type InteractionData } from '@apps/Lobby/src/Interaction';
import type { ClientLobby } from '@apps/Lobby/src/Lobby';
import Vector2D from '@shared/Vector/Vector2D';
import BoundingBox from '@shared/BoundingBox/BoundingBox';
import { Pixi } from '@hooks/pixiRenderer';
import type { CallbackInterface } from 'recoil';
import { modalsAtom } from '@hooks/useModal';
import { SHOP_OPEN_MODAL_ID } from '../hooks/useOpenShopModal';

class ShopInteraction extends Interaction {
  private static readonly CENTER = new Vector2D(507, 400);
  private static readonly DEBUG = false;
  private readonly boundingBox: BoundingBox = new BoundingBox(
    ShopInteraction.CENTER,
    new Vector2D(500, 200)
  );
  constructor(lobby: ClientLobby, data: InteractionData) {
    super(lobby, data);
  }
  static readonly ID = 'shop';
  static create(lobby: ClientLobby) {
    return new ShopInteraction(lobby, {
      id: ShopInteraction.ID,
      keyDisplay: 'B',
      key: 'KeyB',
      label: 'Open Shop',
      showing: false,
    });
  }
  private debugGraphics: Pixi.Graphics | null = null;
  async onMount(): Promise<void> {
    if (!ShopInteraction.DEBUG) return;
    this.debugGraphics = new Pixi.Graphics();
    this.debugGraphics.beginFill(0x00ff00, 0.5);
    this.debugGraphics.drawRect(
      this.boundingBox.topLeft.x,
      this.boundingBox.topLeft.y,
      this.boundingBox.size.x,
      this.boundingBox.size.y
    );
    this.lobby.stage.addChild(this.debugGraphics);
  }
  async destructor(): Promise<void> {
    if (this.debugGraphics) this.lobby.stage.removeChild(this.debugGraphics);
  }
  async update(): Promise<boolean | void> {
    if (this.boundingBox.contains(this.lobby.mainPlayer.transform.position)) {
      return true;
    }
    return false;
  }
  onClick(pressed: boolean, ctx: CallbackInterface): void | Promise<void> {
    if (!pressed) return;
    ctx.set(modalsAtom(SHOP_OPEN_MODAL_ID), true);
  }
}

export { ShopInteraction };

import { Lobby } from '@shared/Lobby/Lobby';
import * as PIXI from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import { LOBBY_STAGE_SIZE, LOBBY_TARGET_FPS } from '@shared/Lobby/constants';
import assetRefCount from '@utils/pixi/AssetRefCount';
import { ClientPlayer } from './Player';
import { ClientCollision } from './Collision';
import {
  LOBBY_BG_BACK_ASSET_URL /* , LOBBY_BG_FRONT_ASSET_URL */,
} from './constants';
import { ClientEvents } from './Events';
import { MutableSnapshot, Snapshot } from 'recoil';
import { Socket } from 'socket.io-client';
import LobbyModel from '@typings/models/lobby';
import { Network } from './Network';
import { enablePlayerInput } from '@apps/Lobby_Old/state';

interface ExtendedSnapshot extends Snapshot {
  mutate: ClientLobby['mutateSnapshot'];
}

export class ClientLobby extends Lobby {
  public readonly app: PIXI.Application;
  public readonly stage: Viewport;
  public loading = true;
  private _snapshot: ExtendedSnapshot | null = null;

  public readonly network: Network = new Network(this);

  private readonly domEvents: [
    {
      removeEventListener: (
        event: string,
        listener: (...args: any[]) => any
      ) => void;
    },
    string,
    (...args: any[]) => any,
  ][] = [];
  public get mainPlayer(): ClientPlayer {
    return this.getPlayer(this.mainPlayerId) as ClientPlayer;
  }

  constructor(
    private container: HTMLDivElement,
    public readonly socket: Socket,
    snapshot: Snapshot | null = null
  ) {
    super([], -1, new ClientCollision(), new ClientEvents(), ClientPlayer);

    if (snapshot) this.snapshot = snapshot;

    this.app = new PIXI.Application({
      antialias: true,
      background: 0x000,
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    });

    const viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: LOBBY_STAGE_SIZE.width,
      worldHeight: LOBBY_STAGE_SIZE.height,
      events: this.app.renderer.events,
      ticker: this.app.ticker,
    });
    viewport.name = 'viewport';
    viewport.clamp({ direction: 'all' });
    viewport.clampZoom({
      maxWidth: LOBBY_STAGE_SIZE.width,
      maxHeight: LOBBY_STAGE_SIZE.height,
    });
    viewport.sortableChildren = true;
    viewport.moveCenter(LOBBY_STAGE_SIZE.divide(2));
    this.stage = viewport;
    this.app.stage.addChild(viewport);
    this.app.ticker.minFPS = LOBBY_TARGET_FPS;
    this.app.ticker.maxFPS = LOBBY_TARGET_FPS;
    container.appendChild(this.app.view as HTMLCanvasElement);
    this.mountEvents();
  }
  public async destructor(): Promise<void> {
    this.domEvents.forEach(([emitter, event, listener]) => {
      emitter.removeEventListener(event, listener);
    });
    await super.destructor();
    this.stage.destroy({
      children: true,
    });
    this.app.destroy(true);
  }
  async onMount(): Promise<void> {
    await this.setupBackground();
    const onUpdateHandler = this.onUpdate.bind(this);
    this.app.ticker.add(onUpdateHandler);
    this.domEvents.push([
      {
        removeEventListener: (_, listener) => this.app.ticker.remove(listener),
      },
      'update',
      onUpdateHandler,
    ]);

    await super.onMount();
  }

  private async setupBackground(): Promise<void> {
    const bgBackLayerTex = await assetRefCount.load(LOBBY_BG_BACK_ASSET_URL);
    if (!bgBackLayerTex) throw new Error('Failed to load background asset');
    const bg = new PIXI.Sprite(bgBackLayerTex);
    bg.name = 'background';
    bg.position.set(0, 0);
    bg.zIndex = -999;

    // const bgFrontLayerTex = await assetRefCount.load(LOBBY_BG_FRONT_ASSET_URL);
    // if (!bgFrontLayerTex) throw new Error('Failed to load background asset');
    // const bgFront = new PIXI.Sprite(bgFrontLayerTex);
    // bgFront.name = 'background';
    // bgFront.position.set(0, 0);
    // bgFront.zIndex = 999;
    this.stage.addChild(bg /* , bgFront */);

    // const debugMask = await assetRefCount.load(publicPath('lobby-mask.png'));
    // if (!debugMask) throw new Error('Failed to load debug mask');
    // const debugMaskSprite = new PIXI.Sprite(debugMask);
    // debugMaskSprite.name = 'debugMask';
    // debugMaskSprite.position.set(0, 0);
    // this.stage.addChild(debugMaskSprite);
  }

  private handleResize(): void {
    if (!this.app.stage) return;
    this.app.view.width = window.innerWidth;
    this.app.view.height = window.innerHeight;
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    this.stage.resize(window.innerWidth, window.innerHeight);
    this.stage.follow(this.mainPlayer.container);
    this.app.render();
  }

  private async isInputEnabled(): Promise<boolean> {
    return (
      (!this.loading && (await this.snapshot?.getPromise(enablePlayerInput))) ??
      false
    );
  }

  private async handleMouseMove(ev: PIXI.FederatedMouseEvent): Promise<void> {
    const mainPlayer = this.mainPlayer;
    if (!mainPlayer) return;
    if (!(await this.isInputEnabled())) return;
    await mainPlayer.handleMouseMove(ev);
  }

  private mountEvents(): void {
    const resizeHandler = this.handleResize.bind(this);
    window.addEventListener('resize', resizeHandler);
    this.domEvents.push([window, 'resize', resizeHandler]);

    const mouseMoveHandler = this.handleMouseMove.bind(this);
    this.stage.addEventListener('mousemove', mouseMoveHandler);
    this.domEvents.push([this.stage, 'mousemove', mouseMoveHandler]);

    const onKeyPress =
      (pressed: boolean) =>
      async (ev: KeyboardEvent): Promise<void> => {
        if (ev.repeat) return;
        const mainPlayer = this.mainPlayer;
        if (!mainPlayer) return;
        if (!pressed) {
          mainPlayer.onKeyRelease(ev.key.toLowerCase());
          return;
        }
        if (!(await this.isInputEnabled())) return;
        mainPlayer.onKeyPress(ev.key.toLowerCase());
      };

    const onKeyPressHandler = onKeyPress(true);
    window.addEventListener('keydown', onKeyPressHandler);
    this.domEvents.push([window, 'keydown', onKeyPressHandler]);
    const onKeyReleaseHandler = onKeyPress(false);
    window.addEventListener('keyup', onKeyReleaseHandler);
    this.domEvents.push([window, 'keyup', onKeyReleaseHandler]);

    const focusChangeHandler = async (): Promise<void> => {
      const mainPlayer = this.mainPlayer;
      if (!mainPlayer) return;
      if (!(await this.isInputEnabled())) return;
      await mainPlayer.resetKeys();
    }
    window.addEventListener('blur', focusChangeHandler);
    this.domEvents.push([window, 'blur', focusChangeHandler]);
  }

  public get snapshot(): ExtendedSnapshot | null {
    return this._snapshot;
  }
  public set snapshot(snapshot: Snapshot | null) {
    this._snapshot = snapshot as ExtendedSnapshot;
    if (!this._snapshot) return;
    this._snapshot.mutate = this.mutateSnapshot.bind(this);
  }
  private mutateSnapshot(cb: (snapshot: MutableSnapshot) => void): void;
  private mutateSnapshot(
    cb: (snapshot: MutableSnapshot) => Promise<void>
  ): Promise<void>;
  private mutateSnapshot(
    cb: (snapshot: MutableSnapshot) => void | Promise<void>
  ): void | Promise<void> {
    if (!this.snapshot) throw new Error('Snapshot not initialized');
    const ret = this.snapshot[cb instanceof Promise ? 'asyncMap' : 'map'](
      cb as any
    );
    if (ret instanceof Promise)
      return new Promise<void>((r) =>
        ret.then((snapshot) => {
          this.snapshot = snapshot;
          r();
        })
      );
    else this.snapshot = ret;
  }

  // Socket Calls
  public async __sockLobbyInit(data: LobbyModel.Models.ILobby): Promise<void> {
    this.loading = true;
    this.chatId = data.chatId;
    await Promise.all(this.players.map((p) => p.destructor()));

    this.mainPlayerId = data.players.find((p) => p.main)!.id;
    // @ts-expect-error impl
    this.players = data.players.map(
      (p) => new ClientPlayer(p.id, p.name, p.character, p.transform, this)
    );
    await Promise.all(this.players.map((p) => p.onMount()));
    this.loading = false;
    this.events.emit('rerender');
  }

  public async __sockPlayerJoin(
    data: LobbyModel.Models.IPlayer
  ): Promise<void> {
    await this.addPlayer(data, data.character, data.transform);
  }

  public async __sockPlayerLeave(id: number): Promise<void> {
    await this.removePlayer(id);
  }
}

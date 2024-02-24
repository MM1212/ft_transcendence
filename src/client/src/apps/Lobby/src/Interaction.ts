import type { IClassLifeCycle } from '@shared/Lobby/utils';
import lobbyState from '../state';
import type { ClientLobby } from './Lobby';
import type { CallbackInterface } from 'recoil';

export interface InteractionData {
  id: string;
  key: string;
  keyDisplay: string;
  label: string;
  showing: boolean;
}

export abstract class Interaction implements IClassLifeCycle {
  public mounted = false;
  protected constructor(
    protected readonly lobby: ClientLobby,
    public readonly data: InteractionData
  ) {}
  abstract update(): Promise<boolean | void>;
  abstract onMount(): Promise<void>;
  abstract destructor(): Promise<void>;
  abstract onClick(
    pressed: boolean,
    ctx: CallbackInterface
  ): void | Promise<void>;

  get id(): string {
    return this.data.id;
  }
  get showing(): boolean {
    return this.data.showing;
  }
  show() {
    if (this.showing) return;
    this.data.showing = true;
    this.lobby.interactions.showing.set(this.data.id, this.data);
  }
  hide() {
    if (!this.showing) return;
    this.data.showing = false;
    this.lobby.interactions.showing.delete(this.data.id);
  }
  static readonly ID: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static create(_lobby: ClientLobby): Interaction {
    throw new Error('Not implemented');
  }
}

export class InteractionManager implements IClassLifeCycle {
  private static readonly INTERVAL = 500;
  private interactions: Interaction[] = [];
  public showing: Map<string, InteractionData> = new Map();
  constructor(private readonly lobby: ClientLobby) {}

  public emplace(IntConst: typeof Interaction) {
    this.interactions.push(IntConst.create(this.lobby));
  }
  public add(interaction: Interaction) {
    this.interactions.push(interaction);
  }
  public async remove(id: string): Promise<void> {
    const idx = this.interactions.findIndex(
      (interaction) => interaction.id === id
    );
    if (idx === -1) return;
    const interaction = this.interactions[idx];
    await interaction.destructor();
    this.interactions.splice(idx, 1);
  }
  async onMount(): Promise<void> {}
  async destructor(): Promise<void> {
    for await (const interaction of this.interactions) {
      await interaction.destructor();
    }
  }

  private readonly cache: Map<string, boolean> = new Map();
  private lastUpdate: number = Date.now();
  public __sync: (ints: InteractionData[]) => void = () => void 0;
  public async update() {
    if (!this.lobby.snapshot) return;
    if (this.interactions.length === 0) return;
    if (Date.now() - this.lastUpdate < InteractionManager.INTERVAL) return;
    this.lastUpdate = Date.now();
    this.cache.clear();
    const showingInteractions = [
      ...(await this.lobby.snapshot.getPromise(lobbyState.showingInteractions)),
    ];
    let anyChanged = false;
    for await (const interaction of this.interactions) {
      if (!interaction.mounted) {
        await interaction.onMount();
        interaction.mounted = true;
      }
      this.cache.set(interaction.id, interaction.showing);
      const show = await interaction.update();
      if (show !== undefined && show !== interaction.showing) {
        if (show) interaction.show();
        else interaction.hide();
      }
      if (this.cache.get(interaction.id) !== interaction.showing) {
        if (interaction.showing) {
          showingInteractions.push({ ...interaction.data });
        } else {
          const idx = showingInteractions.findIndex(
            (int) => int.id === interaction.data.id
          );
          if (idx !== -1) showingInteractions.splice(idx, 1);
        }
        anyChanged = true;
      }
    }

    if (anyChanged) {
      this.__sync(showingInteractions.filter((v, idx) => showingInteractions.findIndex(_v => _v.id === v.id) === idx));
    }
  }

  public async __handleKeydown(
    key: string,
    pressed: boolean,
    ctx: CallbackInterface
  ) {
    for (const interaction of this.interactions) {
      if (key === interaction.data.key && interaction.showing) {
        await Promise.resolve(interaction.onClick(pressed, ctx));
      }
    }
  }
}

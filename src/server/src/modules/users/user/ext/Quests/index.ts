import type { QuestsService } from '@/modules/quests/quests.service';
import User from '../..';
import UserExtBase from '../Base';
import { CacheObserver } from '@shared/CacheObserver';
import QuestsModel from '@typings/models/users/quests';

export class Quest<T extends Record<string, unknown> = Record<string, unknown>>
  extends CacheObserver<QuestsModel.Models.IUserQuest<Record<string, unknown>>>
  implements
    Omit<QuestsModel.Models.IUserQuest<T>, 'userId' | 'currentMilestone'>
{
  constructor(
    private readonly ext: UserExtQuests,
    quest: QuestsModel.Models.IUserQuest<T>,
  ) {
    super(quest);
  }

  get id(): number {
    return this.get('id');
  }

  get tag(): string {
    return this.get('tag');
  }

  get createdAt(): number {
    return this.get('createdAt');
  }

  get updatedAt(): number {
    return this.get('updatedAt');
  }

  get finishedAt(): number | undefined {
    return this.get('finishedAt');
  }

  get completed(): boolean {
    return this.get('completed');
  }

  get meta(): T {
    return this.get('meta') as T;
  }

  get config(): QuestsModel.Models.IQuestConfig {
    return this.ext.service.config.get(this.tag)!;
  }

  get currentMilestoneIdx(): number {
    return this.get('currentMilestone');
  }
  get currentMilestone(): QuestsModel.Models.IQuestMilestone {
    return this.config.milestones[this.get('currentMilestone')];
  }
  get nextMilestone(): QuestsModel.Models.IQuestMilestone | undefined {
    return this.config.milestones[this.get('currentMilestone') + 1];
  }
  get hasNextMilestone(): boolean {
    return !!this.nextMilestone;
  }

  get user(): User {
    return this.ext.user;
  }

  private get helpers(): UserExtBase['helpers'] {
    // @ts-expect-error impl
    return this.ext.helpers;
  }

  async updateMeta(meta: T | ((prev: T) => T)): Promise<void> {
    if (typeof meta === 'function') {
      meta = meta(this.meta);
    }
    const { updatedAt, meta: newMeta } =
      await this.helpers.db.users.quests.update(this.id, {
        meta: meta as any,
      });
    this.set('updatedAt', updatedAt).set('meta', newMeta);
    this.helpers.events.emit('user.quests.update', this.user, this);
    if (
      !this.completed &&
      this.meta[this.currentMilestone.trackMetaKey] ===
        this.currentMilestone.trackMetaValue
    ) {
      await this.next();
    }
  }

  async complete(): Promise<void> {
    if (this.completed) return;
    const { updatedAt } = await this.helpers.db.users.quests.update(this.id, {
      completed: true,
      finishedAt: new Date(),
    });
    this.set('completed', true)
      .set('finishedAt', updatedAt)
      .set('updatedAt', updatedAt);
    this.helpers.events.emit('user.quests.update', this.user, this);
    await this.helpers.events.emitAsync(
      'user.quests.completed',
      this.user,
      this,
    );
  }
  async next(): Promise<void> {
    if (!this.hasNextMilestone) {
      await this.complete();
      return;
    }
    const { updatedAt, completed } = await this.helpers.db.users.quests.update(
      this.id,
      {
        currentMilestone: this.currentMilestoneIdx + 1,
      },
    );
    this.set('currentMilestone', (prev) => prev + 1)
      .set('updatedAt', updatedAt)
      .set('completed', completed);
    await this.helpers.events.emitAsync('user.quests.next', this.user, this, this.config.milestones[this.currentMilestoneIdx - 1]);
  }
}

class UserExtQuests extends UserExtBase {
  constructor(user: User) {
    super(user);
  }

  private get raw(): QuestsModel.Models.IUserQuest[] {
    return this.user.get('quests');
  }

  public get service(): QuestsService {
    return this.helpers.questsService;
  }

  get all(): Quest[] {
    return this.raw.map((quest) => new Quest(this, quest));
  }
  has(id: number): boolean;
  has(tag: string): boolean;
  has(idOrTag: number | string): boolean {
    return this.all.some((quest) => {
      switch (typeof idOrTag) {
        case 'number':
          return quest.id === idOrTag;
        case 'string':
          return quest.tag === idOrTag;
      }
    });
  }

  get(id: number): Quest | undefined;
  get(tag: string): Quest | undefined;
  get(idOrTag: number | string): Quest | undefined {
    const quest = this.all.find((quest) => {
      switch (typeof idOrTag) {
        case 'number':
          return quest.id === idOrTag;
        case 'string':
          return quest.tag === idOrTag;
      }
    });
    return quest;
  }

  async create<T extends Record<string, unknown>>(
    tag: string,
  ): Promise<Quest<T>> {
    if (this.has(tag)) throw new Error('Quest already exists');
    const config = this.service.config.get(tag);
    if (!config) throw new Error('Quest config not found');
    const quest = await this.helpers.db.users.quests.create(
      this.user.id,
      tag,
      config.defaultMeta as any,
    );
    this.raw.push(quest);
    return new Quest<T>(this, quest as QuestsModel.Models.IUserQuest<T>);
  }

  async getOrCreate<T extends Record<string, unknown>>(
    tag: string,
  ): Promise<Quest<T>> {
    return (this.get(tag) ?? (await this.create(tag))) as Quest<T>;
  }
}

export default UserExtQuests;

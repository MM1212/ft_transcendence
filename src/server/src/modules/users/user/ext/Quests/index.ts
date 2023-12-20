import User from '../..';
import UserExtBase from '../Base';
import { CacheObserver } from '@shared/CacheObserver';
import QuestsModel from '@typings/models/quests';

class Quest<T extends Record<string, unknown> = Record<string, unknown>>
  extends CacheObserver<QuestsModel.Models.IQuest<T>>
  implements Omit<QuestsModel.Models.IQuest<T>, 'userId'>
{
  constructor(
    private readonly ext: UserExtQuests,
    quest: QuestsModel.Models.IQuest<T>,
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
    const { updatedAt } = await this.helpers.db.users.quests.update(this.id, {
      meta: meta as any,
    });
    this.set('updatedAt', updatedAt);
    this.helpers.events.emit('user.quests.update', this.user, this);
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
    this.helpers.events.emit('user.quests.completed', this.user, this);
  }
}

class UserExtQuests extends UserExtBase {
  constructor(user: User) {
    super(user);
  }

  private get raw(): QuestsModel.Models.IQuest[] {
    return this.user.get('quests');
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
    meta?: T,
  ): Promise<Quest> {
    if (this.has(tag)) throw new Error('Quest already exists');
    const quest = await this.helpers.db.users.quests.create(
      this.user.id,
      tag,
      meta,
    );
    this.raw.push(quest);
    return new Quest(this, quest);
  }

  async getOrCreate<T extends Record<string, unknown>>(
    tag: string,
    meta?: T,
  ): Promise<Quest> {
    return this.get(tag) ?? (await this.create(tag, meta));
  }
}

export default UserExtQuests;

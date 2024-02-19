import User from '../..';
import UserExtBase from '../Base';
import AchievementsModel from '@typings/models/users/achievements';
import { CacheObserver } from '@shared/CacheObserver';
import NotificationsModel from '@typings/models/notifications';

export class Achievement<
    T extends Record<string, unknown> = Record<string, unknown>,
  >
  extends CacheObserver<
    AchievementsModel.Models.IUserAchievement<Record<string, unknown>>
  >
  implements
    Omit<
      AchievementsModel.Models.IUserAchievement<T>,
      'userId' | 'currentLevel'
    >
{
  constructor(
    private readonly ext: UserExtAchievements,
    data: AchievementsModel.Models.IUserAchievement<T>,
  ) {
    super(data);
  }

  get public(): AchievementsModel.Models.IUserAchievement<T> {
    return this.get() as AchievementsModel.Models.IUserAchievement<T>;
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

  get unlocked(): boolean {
    return this.get('unlocked');
  }
  get unlockedAt(): number | null {
    return this.get('unlockedAt');
  }

  get maxLevel(): number {
    return (
      this.helpers.achievementsService.config.get(this.tag)!.levels.length - 1
    );
  }
  get completed(): boolean {
    return (
      this.currentLevelIdx === this.maxLevel &&
      this.hasCompletedLevel(this.currentLevelIdx)
    );
  }

  hasCompletedLevel(level: number): boolean {
    const levelConfig = this.config.levels[level];
    if (!levelConfig) return false;
    return (
      this.meta[levelConfig.milestone.metaKey] ===
      levelConfig.milestone.metaValue
    );
  }
  get hasCompletedCurrentLevel(): boolean {
    return this.hasCompletedLevel(this.currentLevelIdx);
  }

  get meta(): T {
    return this.get('meta') as T;
  }

  get config(): AchievementsModel.Models.IAchievement {
    return this.helpers.achievementsService.config.get(this.tag)!;
  }

  /*
   ** Current level being tracked
   */
  get currentLevelIdx(): number {
    return this.get('currentLevel');
  }
  get currentLevel(): AchievementsModel.Models.IAchievementLevel {
    return this.config.levels[this.currentLevelIdx];
  }
  get nextLevel(): AchievementsModel.Models.IAchievementLevel | undefined {
    return this.config.levels[this.currentLevelIdx + 1];
  }
  get previousLevel(): AchievementsModel.Models.IAchievementLevel | undefined {
    return this.config.levels[this.currentLevelIdx - 1];
  }
  get hasNextLevel(): boolean {
    return !!this.nextLevel;
  }

  get user(): User {
    return this.ext.user;
  }

  private get helpers(): UserExtBase['helpers'] {
    // @ts-expect-error impl
    return this.ext.helpers;
  }

  async update(meta: T | ((prev: T) => T)): Promise<void> {
    if (typeof meta === 'function') {
      meta = meta(this.meta);
    }
    const { updatedAt, meta: newMeta } =
      await this.helpers.db.users.achievements.update(this.id, {
        meta: meta as any,
      });
    this.set('updatedAt', updatedAt).set('meta', newMeta);
    this.helpers.events.emit('user.achievements.update', this.user, this);
    if (this.hasCompletedCurrentLevel) {
      const willUnlock = !this.unlocked;
      if (!this.unlocked) await this.unlock();
      await this.goToNextLevel(willUnlock);
    }
  }
  async unlock(): Promise<void> {
    if (this.unlocked) return;
    const { updatedAt, unlocked, unlockedAt } =
      await this.helpers.db.users.achievements.update(this.id, {
        unlocked: true,
        unlockedAt: new Date(),
      });
    this.set('unlocked', unlocked)
      .set('unlockedAt', unlockedAt)
      .set('updatedAt', updatedAt);
    await this.helpers.events.emitAsync(
      'user.achievements.update',
      this.user,
      this,
    );
    await this.helpers.events.emitAsync(
      'user.achievements.unlocked',
      this.user,
      this,
    );
    await this.user.notifications.create({
      tag: 'achievement.newLevel',
      data: {
        achievement: this.tag,
        level: this.currentLevelIdx,
      },
      message: `You've unlocked the achievement "${this.currentLevel.title}"!`,
      title: `New achievement!`,
      type: NotificationsModel.Models.Types.Permanent,
      dismissable: true,
    });
  }

  async goToNextLevel(unlocked = false): Promise<void> {
    if (!this.hasNextLevel) {
      return;
    }
    const { updatedAt, currentLevel } =
      await this.helpers.db.users.achievements.update(this.id, {
        currentLevel: this.currentLevelIdx + 1,
      });
    this.set('currentLevel', currentLevel).set('updatedAt', updatedAt);
    await this.helpers.events.emitAsync(
      'user.achievements.update',
      this.user,
      this,
    );
    await this.helpers.events.emitAsync(
      'user.achievements.newLevel',
      this.user,
      this,
    );
    if (unlocked || !this.previousLevel) return;
    await this.user.notifications.create({
      tag: 'achievement.newLevel',
      data: {
        achievement: this.tag,
        level: this.currentLevelIdx,
      },
      message: `You've unlocked the achievement "${this.previousLevel.title}"!`,
      title: `New achievement level!`,
      type: NotificationsModel.Models.Types.Permanent,
      dismissable: true,
    });
  }
}

class UserExtAchievements extends UserExtBase {
  constructor(user: User) {
    super(user);
  }

  public get allUnlocked(): Achievement[] {
    return this.user
      .get('achievements')
      .filter((a) => a.unlocked)
      .map((a) => new Achievement(this, a));
  }
  public get all(): Achievement[] {
    return this.user.get('achievements').map((a) => new Achievement(this, a));
  }

  has(id: number, checkForUnlocked?: boolean): boolean;
  has(tag: string, checkForUnlocked?: boolean): boolean;
  has(idOrTag: number | string, checkForUnlocked: boolean = true): boolean {
    return this.all.some((achievement) => {
      if (checkForUnlocked && !achievement.unlocked) return false;
      switch (typeof idOrTag) {
        case 'number':
          return achievement.id === idOrTag;
        case 'string':
          return achievement.tag === idOrTag;
      }
    });
  }
  async get<T extends Record<string, unknown> = Record<string, unknown>>(
    id: number,
  ): Promise<Achievement<T>>;
  async get<T extends Record<string, unknown> = Record<string, unknown>>(
    tag: string,
  ): Promise<Achievement<T>>;
  async get<T extends Record<string, unknown> = Record<string, unknown>>(
    idOrTag: number | string,
  ): Promise<Achievement<T>> {
    const achievement = this.all.find((achievement) => {
      switch (typeof idOrTag) {
        case 'number':
          return achievement.id === idOrTag;
        case 'string':
          return achievement.tag === idOrTag;
      }
    });
    if (!achievement && typeof idOrTag === 'string')
      return (await this.create(idOrTag as string)) as Achievement<T>;
    if (!achievement) throw new Error('Invalid achievement ID');
    return achievement as Achievement<T>;
  }

  public async create(tag: string): Promise<Achievement> {
    if (this.has(tag, false))
      throw new Error('User already has this achievement');
    const config = this.helpers.achievementsService.get(tag);
    if (!config) throw new Error('Invalid achievement tag');
    const achievementData = await this.helpers.db.users.achievements.create(
      this.user.id,
      tag,
      config.defaultMeta,
    );
    this.user.set('achievements', (prev) => [...prev, achievementData]);
    return new Achievement(this, achievementData);
  }

  async delete(id: number): Promise<boolean> {
    if (!this.has(id)) return false;
    await this.helpers.db.users.achievements.delete(id);
    this.user.set('achievements', (prev) =>
      prev.filter((achievement) => achievement.id !== id),
    );
    return true;
  }
}

export default UserExtAchievements;

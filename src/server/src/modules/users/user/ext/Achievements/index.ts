import User from '../..';
import UserExtBase from '../Base';
import { CacheObserver } from '@shared/CacheObserver';
import AchievementsModel from '@typings/models/users/achievements';

class UserExtAchievements extends UserExtBase {
  constructor(user: User) {
    super(user);
  }

  public get all(): AchievementsModel.Models.IUserAchievement[] {
    return this.user.get('achievements');
  }

  has(id: number): boolean;
  has(tag: string): boolean;
  has(idOrTag: number | string): boolean {
    return this.all.some((achievement) => {
      switch (typeof idOrTag) {
        case 'number':
          return achievement.id === idOrTag;
        case 'string':
          return achievement.tag === idOrTag;
      }
    });
  }

  get(id: number): AchievementsModel.Models.IUserAchievement | undefined;
  get(tag: string): AchievementsModel.Models.IUserAchievement | undefined;
  get(
    idOrTag: number | string,
  ): AchievementsModel.Models.IUserAchievement | undefined {
    const achievement = this.all.find((achievement) => {
      switch (typeof idOrTag) {
        case 'number':
          return achievement.id === idOrTag;
        case 'string':
          return achievement.tag === idOrTag;
      }
    });
    return achievement;
  }

  async add(
    tag: string,
  ): Promise<AchievementsModel.Models.IUserAchievement> {
    if (this.has(tag)) throw new Error('Achievement already exists');
    const achievement = await this.helpers.db.users.achievements.create(
      this.user.id,
      tag,
    );
    this.all.push(achievement);
    return achievement;
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

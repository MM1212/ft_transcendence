import NotificationsModel from '@typings/models/notifications';
import User from '../..';
import UserExtBase from '../Base';
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

  async add(tag: string): Promise<AchievementsModel.Models.IUserAchievement> {
    if (this.has(tag)) throw new Error('Achievement already exists');
    const achievement = await this.helpers.db.users.achievements.create(
      this.user.id,
      tag,
    );
    this.all.push(achievement);
    const config = this.helpers.achievementsService.get(tag)!;
    await this.user.notifications.create({
      tag: 'achievements:unlocked',
      data: { tag: achievement.tag },
      message: `You have unlocked a new achievement: ${config.title}`,
      title: 'Achievement Unlocked',
      type: NotificationsModel.Models.Types.Permanent,
      dismissable: true,
    });
    return achievement;
  }
  async increaseLevel(
    tag: string,
  ): Promise<AchievementsModel.Models.IUserAchievement> {
    const achievement = this.get(tag);
    if (!achievement) throw new Error('Achievement does not exist');
    if (
      achievement.currentLevel ===
      this.helpers.achievementsService.get(achievement.tag)!.levels.length - 1
    )
      return achievement;
    const { updatedAt, currentLevel } =
      await this.helpers.db.users.achievements.update(achievement.id, {
        currentLevel: achievement.currentLevel + 1,
      });
    achievement.updatedAt = updatedAt;
    achievement.currentLevel = currentLevel;
    await this.user.notifications.create({
      tag: 'achievements:unlocked',
      data: { tag: achievement.tag },
      message: `You have reached a new level in the achievement: ${achievement.tag}`,
      title: 'Achievement Unlocked',
      type: NotificationsModel.Models.Types.Permanent,
      dismissable: true,
    });
    return achievement;
  }
  async addOrIncreaseLevel(
    tag: string,
  ): Promise<AchievementsModel.Models.IUserAchievement> {
    return this.has(tag) ? await this.increaseLevel(tag) : await this.add(tag);
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

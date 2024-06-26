import { AchievementsService } from '@/modules/achievements/achievements.service';
import { Injectable } from '@nestjs/common';
import AchievementsModel from '@typings/models/users/achievements/index';
import User from '../user/index';

@Injectable()
export class UserAchievementsService {
  public constructor(
    private readonly achievementsService: AchievementsService,
  ) {}

  public getUserAchievements(user: User, all: boolean = false) {
    const userAchievements = user.achievements.all
      .map<AchievementsModel.DTO.IMixedAchievement | null>((a) => {
        const config = this.achievementsService.get(a.tag);
        if (!config) return null;
        return {
          unlocked: a.unlocked,
          userAchievement: a.public,
          achievement: config,
          previousLevel: a.completed ? a.currentLevel : a.previousLevel,
          currentLevel: a.currentLevel,
          nextLevel: a.nextLevel,
          completed: a.completed,
          currentLevelIdx: a.currentLevelIdx,
        } satisfies AchievementsModel.DTO.IMixedAchievement;
      })
      .filter(Boolean) as AchievementsModel.DTO.IMixedAchievement[];
    if (!all) return userAchievements
    const lockedAchievements = this.achievementsService
      .getAll()
      .filter((a) => !user.achievements.has(a.tag, false))
      .map<AchievementsModel.DTO.IMixedAchievement>((a) => ({
        unlocked: false,
        achievement: a,
        currentLevel: a.levels[0],
        completed: false,
        currentLevelIdx: -1,
      }));
    userAchievements.push(...lockedAchievements);
    return userAchievements;
  }
}

import { AchievementsService } from '@/modules/achievements/achievements.service';
import { Injectable } from '@nestjs/common';
import type { Quest } from "../user/ext/Quests";
import AchievementsModel from '@typings/models/users/achievements/index';
import User from '../user/index';

@Injectable()
export class UserAchievementsService {
  public constructor(
    private readonly achievementsService: AchievementsService,
  ) {}

  public getUserAchievements(user: User, all: boolean = false) {
    const userAchievements = user.achievements.all
      .map<AchievementsModel.DTO.IMixedAchievement>((a) => ({
        unlocked: true,
        ...a,
        config: this.achievementsService.get(a.tag)!,
      }))
      .filter((a) => a.unlocked && a.config);
    if (all) {
      const lockedAchievements = this.achievementsService
        .getAll()
        .filter((a) => !user.achievements.has(a.tag))
        .map<AchievementsModel.DTO.IMixedAchievement>((a) => ({
          ...a,
          unlocked: false,
        }));
      userAchievements.push(...lockedAchievements);
    }
    return userAchievements;
  }

  public async onQuestCompleted(user: User, quest: Quest) {
    const achievementsWithQuest = this.achievementsService.getAllWithQuests(quest.tag);
    for (const achievement of achievementsWithQuest) {
      if (user.achievements.has(achievement.tag)) {
        continue;
      }
      const requirements = achievement.quests.map((q) => user.quests.get(q));
      const hasAllRequirements = requirements.every((r) => r && r.completed);
      if (hasAllRequirements) {
        await user.achievements.add(achievement.tag);
      }
    }
  }
}

//GetUserAchievements = "/users/:userId/achievements"

import { AchievementsService } from '@/modules/achievements/achievements.service';
import { Injectable } from '@nestjs/common';
import type { Quest } from '../user/ext/Quests';
import AchievementsModel from '@typings/models/users/achievements/index';
import User from '../user/index';
import type QuestsModel from '@typings/models/users/quests';

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

  public async onQuestNewMilestone(
    user: User,
    quest: Quest,
    milestonePassed: QuestsModel.Models.IQuestMilestone,
  ): Promise<void> {
    const achievementsWithQuest = this.achievementsService
      .getAllWithQuests(quest.tag)
      .filter((a) =>
        a.levels.some((l) => l.questMilestone === milestonePassed.tag),
      );
    for (const achievement of achievementsWithQuest) {
      await user.achievements.addOrIncreaseLevel(achievement.tag);
    }
  }
}

//GetUserAchievements = "/users/:userId/achievements"

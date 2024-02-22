import { Injectable, Logger } from '@nestjs/common';
import { CacheObserver } from '@shared/CacheObserver';
import AchievementsModel from '@typings/models/users/achievements';
import fs from 'fs/promises';

@Injectable()
export class AchievementsService {
  private readonly configPath: string = 'dist/assets/achievements/config.json';
  public readonly config: Map<string, AchievementsModel.Models.IAchievement> =
    new Map();
  private readonly logger = new Logger(AchievementsService.name);
  constructor() {
    this.loadConfig();
  }

  public getAll(): AchievementsModel.Models.IAchievement[] {
    return Array.from(this.config.values());
  }
  public getSize(): number {
    return this.config.size;
  }

  private async loadConfig() {
    const file = await fs.readFile(this.configPath, 'utf-8');
    const config = JSON.parse(file);
    for (const entry of config) {
      const achievement = this.parseAchievement(entry);
      this.config.set(achievement.tag, achievement);
      this.logger.verbose(`Loaded achievement: ${achievement.tag}`);
    }
  }

  private parseAchievement(
    cfg: AchievementsModel.Models.IRawAchievement,
  ): AchievementsModel.Models.IAchievement {
    const achievement: AchievementsModel.Models.IAchievement = {
      tag: cfg.tag,
      icon: cfg.icon,
      title: cfg.title,
      bannerColor: cfg.bannerColor,
      defaultMeta: cfg.defaultMeta || {},
      trackMessageSuffix: cfg.trackMessageSuffix,
      levels: cfg.levels.map((l) => this.parseAchievementLevel(cfg, l)),
    };
    return achievement;
  }
  private parseAchievementLevel(
    achievement: AchievementsModel.Models.IRawAchievement,
    cfg: AchievementsModel.Models.IRawAchievementLevel,
  ): AchievementsModel.Models.IAchievementLevel {
    if (!cfg.description && !achievement.defaultDescription) {
      throw new Error('Achievement description is missing');
    }
    if (!achievement.defaultOperator) achievement.defaultOperator = 'eq';
    if (typeof cfg.milestone !== 'object' && !achievement.defaultTrackMetaKey) {
      throw new Error('Achievement milestone is invalid');
    }
    const level: AchievementsModel.Models.IAchievementLevel = {
      title: cfg.titleMod
        ? `${achievement.title} - ${cfg.titleMod}`
        : achievement.title,
      description: (cfg.description || achievement.defaultDescription)!,
      milestone:
        typeof cfg.milestone !== 'object'
          ? {
              metaKey: achievement.defaultTrackMetaKey!,
              metaValue: cfg.milestone as unknown,
              operator: achievement.defaultOperator!,
            }
          : (cfg.milestone as AchievementsModel.Models.IAchievementLevelMilestone),
      type: cfg.type,
    };
    const observer =
      new CacheObserver<AchievementsModel.Models.IRawAchievementLevel>(level);
    level.description = level.description.replace(/{{(.*?)}}/g, (_, key) => {
      return observer.get(key);
    });
    return level;
  }

  public get(tag: string): AchievementsModel.Models.IAchievement | undefined {
    return this.config.get(tag);
  }
}

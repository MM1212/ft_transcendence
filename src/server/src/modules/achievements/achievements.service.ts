import { Injectable } from '@nestjs/common';
import AchievementsModel from '@typings/models/users/achievements/index';
import fs from 'fs/promises';

@Injectable()
export class AchievementsService {
  private readonly configPath: string = 'dist/assets/achievements/config.json';
  public readonly config: Map<string, AchievementsModel.Models.IAchievement> =
    new Map();
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
      this.config.set(entry.tag, entry);
    }
  }

  public get(tag: string): AchievementsModel.Models.IAchievement | undefined {
    return this.config.get(tag);
  }

  public getAllWithQuests(
    questTag: string,
  ): AchievementsModel.Models.IAchievement[] {
    return this.getAll().filter((a) => a.quests.includes(questTag));
  }
}

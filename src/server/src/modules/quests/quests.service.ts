import { Injectable, Logger } from '@nestjs/common';
import QuestsModel from '@typings/models/users/quests';
import fs from 'fs/promises';

@Injectable()
export class QuestsService {
  private readonly configPath: string = 'dist/assets/quests/config.json';
  public readonly config: Map<string, QuestsModel.Models.IQuestConfig> =
    new Map();
  private readonly logger = new Logger(QuestsService.name);
  constructor() {
    this.loadConfig();
  }

  public getAll(): QuestsModel.Models.IQuestConfig[] {
    return Array.from(this.config.values());
  }
  public getSize(): number {
    return this.config.size;
  }

  private async loadConfig() {
    const file = await fs.readFile(this.configPath, 'utf-8');
    const config = JSON.parse(file) as QuestsModel.Models.IQuestRawConfig;
    for (const [tag, rawConfig] of Object.entries(config)) {
      this.config.set(tag, {
        tag,
        ...rawConfig,
        milestones: rawConfig.milestones
          .map<QuestsModel.Models.IQuestMilestone | undefined>((milestone) => {
            if (typeof milestone !== 'object') {
              if (!rawConfig.trackMetaKey) {
                this.logger.error(`No trackMetaKey for ${tag}:${milestone}!`);
                return;
              }
              return {
                tag: `${tag}:${milestone}`,
                questTag: tag,
                trackMetaKey: rawConfig.trackMetaKey,
                trackMetaValue: milestone,
              } satisfies QuestsModel.Models.IQuestMilestone;
            }
            if (!rawConfig.trackMetaKey && !milestone.trackMetaKey) {
              this.logger.error(`No trackMetaKey for ${tag}:${milestone.tag}!`);
              return;
            }
            return {
              ...milestone,
              trackMetaKey: milestone.trackMetaKey ?? rawConfig.trackMetaKey,
              questTag: tag,
            };
          })
          .filter(Boolean) as QuestsModel.Models.IQuestMilestone[],
      });
    }
  }

  public get(tag: string): QuestsModel.Models.IQuestConfig | undefined {
    return this.config.get(tag);
  }

}

import {
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  GroupEndpointTargets,
} from '@typings/api';

namespace AchievementsModel {
  export namespace Models {
    export interface IUserAchievement {
      id: number;
      userId: number;
      tag: string;
      createdAt: number;
      updatedAt: number;
      currentLevel: number;
    }

    export interface IAchievementLevel {
      type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
      titleMod?: string;
      description: string;
      questMilestone: string;
    }

    export interface IAchievement {
      tag: string;
      title: string;
      icon: string;
      bannerColor: string;
      quest: string;
      levels: IAchievementLevel[];
    }
  }
  export namespace DTO {
    export type IMixedAchievement =
      | ({
          unlocked: true;
        } & AchievementsModel.Models.IUserAchievement & {
            config: AchievementsModel.Models.IAchievement;
          })
      | ({ unlocked: false } & AchievementsModel.Models.IAchievement);
    export namespace DB {
      export interface IUserAchievement
        extends Omit<Models.IUserAchievement, 'createdAt' | 'updatedAt'> {
        createdAt: Date;
        updatedAt: Date;
      }
    }

    export interface GetAchievementParams extends Record<string, unknown> {
      tag: string;
    }

    export interface GetUserAchievementsParams extends Record<string, unknown> {
      userId: number;
      all?: boolean;
    }

    export interface GetUserAchievements {
      achievements: IMixedAchievement[];
      total: number;
    }
  }

  export namespace Endpoints {
    export enum Targets {
      GetAchievements = '/achievements',
      GetAchievement = '/achievements/:tag',
      GetUserAchievements = '/users/:userId/achievements',
    }
    export type All = GroupEndpointTargets<Targets>;

    export interface GetAchievements
      extends GetEndpoint<Targets.GetAchievements, Models.IAchievement[]> {}

    export interface GetAchievement
      extends GetEndpoint<
        Targets.GetAchievement,
        Models.IAchievement,
        DTO.GetAchievementParams
      > {}

    export interface GetUserAchievements
      extends GetEndpoint<
        Targets.GetUserAchievements,
        DTO.GetUserAchievements,
        DTO.GetUserAchievementsParams
      > {}

    export interface Registry extends EndpointRegistry {
      [EndpointMethods.Get]: {
        [Targets.GetAchievements]: GetAchievements;
        [Targets.GetAchievement]: GetAchievement;
        [Targets.GetUserAchievements]: GetUserAchievements;
      };
    }
  }
}

export default AchievementsModel;

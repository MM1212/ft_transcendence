import {
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  GroupEndpointTargets,
} from '@typings/api';

namespace AchievementsModel {
  export namespace Models {
    export interface IUserAchievement<
      T extends Record<string, unknown> = Record<string, unknown>
    > {
      id: number;
      userId: number;
      tag: string;
      createdAt: number;
      updatedAt: number;
      unlockedAt: number | null;
      unlocked: boolean;
      currentLevel: number;
      meta: T;
    }

    export interface IAchievementLevelMilestone<T = unknown> {
      metaKey: string;
      metaValue: T;
    }
    export interface IAchievementLevel {
      type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
      title: string;
      description: string;
      milestone: IAchievementLevelMilestone;
    }

    export interface IRawAchievementLevel<T = unknown>
      extends Omit<IAchievementLevel, 'milestone' | 'title' | 'description'> {
      titleMod?: string;
      description?: string;
      milestone: T | IAchievementLevelMilestone<T>;
    }

    export interface IAchievement {
      tag: string;
      title: string;
      icon: string;
      bannerColor: string;
      defaultMeta: Record<string, unknown>;
      trackMessageSuffix: string;
      levels: IAchievementLevel[];
    }

    export interface IRawAchievement<T = unknown>
      extends Omit<IAchievement, 'levels'> {
      defaultDescription?: string;
      defaultTrackMetaKey?: string;
      levels: IRawAchievementLevel<T>[];
    }
  }
  export namespace DTO {
    export type IMixedAchievement = {
      unlocked: boolean;
      userAchievement?: Models.IUserAchievement;
      achievement: Models.IAchievement;
      previousLevel?: Models.IAchievementLevel;
      currentLevel: Models.IAchievementLevel;
      nextLevel?: Models.IAchievementLevel;
    };
    export namespace DB {
      export interface IUserAchievement
        extends Omit<
          Models.IUserAchievement,
          'createdAt' | 'updatedAt' | 'unlockedAt' | 'meta'
        > {
        createdAt: Date;
        updatedAt: Date;
        unlockedAt: Date | null;
        meta: any;
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

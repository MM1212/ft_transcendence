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

    export type IRawAchievementLevelOperator =
      | 'eq'
      | 'ne'
      | 'gt'
      | 'gte'
      | 'lt'
      | 'lte';
    export interface IAchievementLevelMilestone<T = unknown> {
      metaKey: string;
      metaValue: T;
      operator: IRawAchievementLevelOperator;
    }

    export interface IAchievementLevel {
      type: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
      title: string;
      description: string;
      milestone: IAchievementLevelMilestone;
    }

    export interface IRawAchievementLevel<T = unknown>
      extends Omit<
        IAchievementLevel,
        'milestone' | 'title' | 'description' | 'operator'
      > {
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
      defaultOperator?: IRawAchievementLevelOperator;
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
      currentLevelIdx: number;
      nextLevel?: Models.IAchievementLevel;
      completed: boolean;
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

    export interface GetSessionAchievementsParams
      extends Omit<GetUserAchievementsParams, 'userId'> {}

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
      GetSessionAchievements = '/me/achievements',
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

    export interface GetSessionAchievements
      extends GetEndpoint<
        Targets.GetSessionAchievements,
        DTO.GetUserAchievements,
        DTO.GetSessionAchievementsParams
      > {}

    export interface Registry extends EndpointRegistry {
      [EndpointMethods.Get]: {
        [Targets.GetAchievements]: GetAchievements;
        [Targets.GetAchievement]: GetAchievement;
        [Targets.GetUserAchievements]: GetUserAchievements;
        [Targets.GetSessionAchievements]: GetSessionAchievements;
      };
    }
  }
}

export default AchievementsModel;

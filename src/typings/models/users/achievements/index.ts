import { EndpointMethods, EndpointRegistry, GetEndpoint, GroupEndpointTargets } from "@typings/api";

namespace AchievementsModel {
  export namespace Models {
    export interface IUserAchievement {
      id: number;
      userId: number;
      tag: string;
      createdAt: number;
    }

    export interface IAchievement {
      tag: string;
      title: string;
      description: string;
      icon: string;
      bannerColor: string;
      quests: string[];
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
        extends Omit<Models.IUserAchievement, "createdAt"> {
        createdAt: Date;
      }
    }

    export interface GetAchievementParams extends Record<string, unknown> {
      tag: string;
    }

    export interface GetUserAchievementsParams extends Record<string, unknown> {
      userId: number;
      all?: boolean;
    }
  }

  export namespace Endpoints {
    export enum Targets {
      GetAchievements = "/achievements",
      GetAchievement = "/achievements/:tag",
      GetUserAchievements = "/users/:userId/achievements",
      GetSessionAchievements = "/me/achievements",
    }
    export type All = GroupEndpointTargets<Targets>;

    export interface GetAchievements
      extends GetEndpoint<Targets.GetAchievements, Models.IAchievement[]> {}
    
    export interface GetAchievement
      extends GetEndpoint<Targets.GetAchievement, Models.IAchievement, DTO.GetAchievementParams> {}
    
    export interface GetUserAchievements
      extends GetEndpoint<Targets.GetUserAchievements, DTO.IMixedAchievement[], DTO.GetUserAchievementsParams> {}

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

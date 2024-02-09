import type {
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  GroupEndpointTargets,
} from '@typings/api';

namespace LeaderboardModel {
  export namespace Models {
    export enum MatchResult {
      Win,
      Loss,
      Tie,
    }
    export interface PositionsCacheEntry {
      userId: number;
      position: number;
      elo: number;
    }
    export interface Reward {
      userId: number;
      value: number;
    }
    export interface Leaderboard {
      id: number;
      userId: number;
      elo: number;
      wins: number;
      losses: number;
      ties: number;
      streak: number; // positive for win streak, negative for loss streak
      createdAt: number;
      updatedAt: number;
    }
  }
  export namespace DTO {
    export namespace BD {
      export interface Leaderboard
        extends Omit<Models.Leaderboard, 'createdAt' | 'updatedAt' | 'userId'> {
        createdAt: Date;
        updatedAt: Date;
        user: { id: number } | null;
      }

      export interface GetLimits extends Record<string, unknown> {
        limit?: number;
        offset?: number;
      }
    }
    export interface Leaderboard extends Models.Leaderboard {
      position?: number;
    }
  }
  export namespace Endpoints {
    export enum Targets {
      GetLeaderboard = '/leaderboard',
    }
    export type All = GroupEndpointTargets<Targets>;

    export interface GetLeaderboard
      extends GetEndpoint<
        Targets.GetLeaderboard,
        DTO.Leaderboard[],
        DTO.BD.GetLimits
      > {}

    export interface Registry extends EndpointRegistry {
      [EndpointMethods.Get]: {
        [Targets.GetLeaderboard]: GetLeaderboard;
      };
    }
  }
  export namespace Sse {}
}

export default LeaderboardModel;

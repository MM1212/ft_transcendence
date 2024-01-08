import {
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  GroupEndpointTargets,
} from '@typings/api';

namespace PongHistoryModel {
  export namespace Models {
    export interface PlayerGear extends Record<string, unknown> {
      paddle: string;
      specialPower: string;
    }
    export interface Player {
      id: number;
      userId: number;
      score: number;
      gear: PlayerGear;
      stats: Record<string, unknown>;
      owner: boolean;
      mvp: boolean;
      teamId: number;
      createdAt: number;
    }
    export interface Team {
      id: number;
      score: number;
      matchId: number;
      players: Player[];
      won: boolean;
      stats: Record<string, unknown>;
      createdAt: number;
    }
    export interface Match {
      id: number;
      teams: Team[];
      winnerTeamId: number;
      stats: Record<string, unknown>;
      createdAt: number;
    }
  }
  export namespace DTO {
    export namespace DB {
      export interface Player
        extends Omit<Models.Player, 'createdAt' | 'stats' | 'gear'> {
        createdAt: Date;
        stats: any;
        gear: any;
      }
      export interface Team
        extends Omit<Models.Team, 'createdAt' | 'stats' | 'players'> {
        createdAt: Date;
        stats: any;
        players: Player[];
      }
      export interface Match
        extends Omit<Models.Match, 'createdAt' | 'stats' | 'teams'> {
        createdAt: Date;
        stats: any;
        teams: Team[];
      }
    }

    export interface GetByUserIdParams extends Record<string, unknown> {
      id: number;
      skip?: number;
      take?: number;
      cursor?: number;
    }
  }
  export namespace Endpoints {
    export enum Targets {
      GetAllByUserId = '/pong/history/:id',
      GetAllBySession = '/me/pong/history',
    }

    export type All = GroupEndpointTargets<Targets>;

    export interface GetAllByUserId
      extends GetEndpoint<
        Targets.GetAllByUserId,
        Models.Match[],
        DTO.GetByUserIdParams
      > {}
    export interface GetAllBySession
      extends GetEndpoint<Targets.GetAllBySession, Models.Match[]> {}

    export interface Registry extends EndpointRegistry {
      [EndpointMethods.Get]: {
        [Targets.GetAllByUserId]: GetAllByUserId;
        [Targets.GetAllBySession]: GetAllBySession;
      };
    }
  }
}

export default PongHistoryModel;

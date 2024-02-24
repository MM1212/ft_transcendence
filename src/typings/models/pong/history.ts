import {
  EndpointMethods,
  EndpointRegistry,
  GetEndpoint,
  GroupEndpointTargets,
} from '@typings/api';
import type PongModel from '.';
import type { GroupEnumValues } from '@typings/utils';

namespace PongHistoryModel {
  export namespace Models {
    export interface PlayerStats {
      goalsScored: number;
      shotsFired: number;
      shotHit: number;
      hittenByPower: number;
      powerAccuracy: number;
      manaSpent: number;
      bubble_DirectGoal: number;
      fire_DirectGoal: number;
      ice_ScoredOpponentAffected: number;
      spark_ScoredOpponentAffected: number;
      ghost_ScoredOpponentInvisible: number;
      winningGoal: number;
      moneyEarned: number;
      playerScore: number;
      ballBounces: number;
      elo: number | null;
    }
    export interface PlayerGear extends Record<string, unknown> {
      paddle: string;
      specialPower: string;
    }
    export interface Player {
      id: number;
      userId: number;
      score: number;
      gear: PlayerGear;
      stats: PlayerStats;
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
      stats: {};
      createdAt: number;
    }
    export interface Match {
      id: number;
      type: GroupEnumValues<PongModel.Models.LobbyType>;
      gameType: GroupEnumValues<PongModel.Models.LobbyGameType>;
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
        extends Omit<Models.Match, 'createdAt' | 'stats' | 'teams' | 'gameType'> {
        createdAt: Date;
        stats: any;
        teams: Team[];
        gameType: string;
      }

      export interface CreatePlayer
        extends Pick<
          Models.Player,
          'gear' | 'stats' | 'score' | 'owner' | 'mvp' | 'userId' | 'teamId'
        > {}

      export interface CreateTeam
        extends Pick<Models.Team, 'won' | 'stats' | 'score'> {
        players: CreatePlayer[];
      }
      export interface CreateMatch
        extends Pick<Models.Match, 'stats' | 'winnerTeamId' | 'type'> {
        teams: CreateTeam[];
        gameType: GroupEnumValues<PongModel.Models.LobbyGameType>;
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

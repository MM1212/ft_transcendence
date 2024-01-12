import { ComputeToZodKeys } from '@/helpers/decorators/validator';
import PongModel from '@typings/models/pong';
import { ZodType, z } from 'zod';

const ponglobbyValidator = new (class PongLobbyControllerValidator {
  newLobbySchema: ZodType<PongModel.DTO.CreateLobby> = z.object({
    name: z.string().min(1).max(20, {
      message: 'Lobby name must be between 1 and 20 characters',
    }),
    password: z
      .string()
      .min(1)
      .max(20, {
        message: 'Lobby password must be between 1 and 20 characters',
      })
      .nullable(),
    spectators: z.enum(
      [
        PongModel.Models.LobbySpectatorVisibility.All,
        PongModel.Models.LobbySpectatorVisibility.Friends,
        PongModel.Models.LobbySpectatorVisibility.None,
      ],
      {
        description: 'Spectator visibility',
      },
    ),
    lobbyAccess: z.enum(
      [
        PongModel.Models.LobbyAccess.Public,
        PongModel.Models.LobbyAccess.Private,
        PongModel.Models.LobbyAccess.Protected,
      ],
      {
        description: 'Lobby access type',
      },
    ),
    lobbyType: z.enum(
      [
        PongModel.Models.LobbyType.Custom,
        PongModel.Models.LobbyType.Single,
        PongModel.Models.LobbyType.Double,
      ],
      {
        description: 'Lobby type',
      },
    ),
    gameType: z.enum(
      [
        PongModel.Models.LobbyGameType.Classic,
        PongModel.Models.LobbyGameType.Powers,
      ],
      {
        description: 'Game type',
      },
    ),
    score: z.number().int().min(1).max(100, {
      message: 'Score must be between 1 and 100',
    }),
  } satisfies ComputeToZodKeys<PongModel.DTO.CreateLobby>);

  checkIdSchema: ZodType<PongModel.DTO.CheckId> = z.object({
    lobbyId: z.number().int().nonnegative(),
  } satisfies ComputeToZodKeys<PongModel.DTO.CheckId>);

  joinLobbySchema: ZodType<PongModel.DTO.JoinLobby> = z.object({
    lobbyId: z.number().int().nonnegative(),
    password: z
      .string()
      .max(20, {
        message: 'Lobby password must be between 1 and 20 characters',
      })
      .nullable(),
    nonce: z.number().int().positive(),
  } satisfies ComputeToZodKeys<PongModel.DTO.JoinLobby>);

  changeTeamSchema: ZodType<PongModel.DTO.ChangeTeam> = z.object({
    lobbyId: z.number().int().nonnegative(),
    teamId: z.number().int().min(0).max(1),
    teamPosition: z.number().int().min(-1).max(1),
  } satisfies ComputeToZodKeys<PongModel.DTO.ChangeTeam>);

  changeOwnerSchema: ZodType<PongModel.DTO.ChangeOwner> = z.object({
    lobbyId: z.number().int().nonnegative(),
    ownerToBe: z.number().int().nonnegative(),
  } satisfies ComputeToZodKeys<PongModel.DTO.ChangeOwner>);

  kickSchema: ZodType<PongModel.DTO.Kick> = z.object({
    lobbyId: z.number().int().nonnegative(),
    userId: z.number().int().nonnegative(),
  } satisfies ComputeToZodKeys<PongModel.DTO.Kick>);

  inviteSchema: ZodType<PongModel.DTO.Invite> = z.object({
    lobbyId: z.number().int().nonnegative(),
    source: z.enum(
      [PongModel.Models.InviteSource.Lobby, PongModel.Models.InviteSource.Chat],
      {
        description: 'Invite source',
      },
    ),
    data: z
      .object(
        {
          id: z.number().int().nonnegative(),
          type: z.string(),
        },
        {
          description: 'Invite data',
        },
      )
      .array(),
  } satisfies ComputeToZodKeys<PongModel.DTO.Invite>);
})();

export default ponglobbyValidator;

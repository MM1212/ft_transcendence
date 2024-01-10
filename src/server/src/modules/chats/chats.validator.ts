import { ComputeToZodKeys } from '@/helpers/decorators/validator';
import ChatsModel from '@typings/models/chat';
import { ZodType, z } from 'zod';

const chatValidator = new (class ChatControllerValidator {
  // ChatsModel.Endpoints.Targets.CreateChat
  newChatSchema: ZodType<ChatsModel.DTO.NewChat> = z.object({
    type: z.enum([ChatsModel.Models.ChatType.Group], {
      description: 'Chat type',
    }),
    name: z.string().min(3).max(50, {
      message: 'Chat name must be between 3 and 50 characters',
    }),
    topic: z.string().max(200, {
      message: 'Chat topic cannot be more than 200 characters',
    }),
    authorization: z.enum(
      [
        ChatsModel.Models.ChatAccess.Public,
        ChatsModel.Models.ChatAccess.Private,
        ChatsModel.Models.ChatAccess.Protected,
      ],
      {
        description: 'Chat authorization type',
      },
    ),
    authorizationData: z
      .object({
        password: z.string().max(50, {
          message: 'Chat password cannot be more than 50 characters',
        }),
      })
      .nullable(),
    participants: z.array(
      z.object({
        userId: z.number().int().positive(),
        role: z.enum([ChatsModel.Models.ChatParticipantRole.Member], {
          description: 'Chat participant role',
        }),
      } satisfies ComputeToZodKeys<ChatsModel.DTO.DB.CreateChatParticipant>),
    ),
    photo: z
      .string()
      .url()
      .nullable()
      .default(null) as unknown as z.ZodNullable<z.ZodString>,
  } satisfies ComputeToZodKeys<ChatsModel.DTO.NewChat>);

  // ChatsModel.Endpoints.Targets.CreateMessage
  newMessageSchema: ZodType<ChatsModel.DTO.NewMessage> = z.object({
    message: z.string().min(1),
    meta: z
      .object({
        type: z
          .enum(
            [
              ChatsModel.Models.Embeds.Type.System,
              ChatsModel.Models.Embeds.Type.ChatInvite,
              ChatsModel.Models.Embeds.Type.GameInvite,
              ChatsModel.Models.Embeds.Type.Media,
              ChatsModel.Models.Embeds.Type.UserProfile,
            ],
            {
              description: 'Chat message embed type',
            },
          )
          .optional() as any,
        chatId: z.number().int().positive().optional(),
        inviteNonce: z.string().optional(),
        lobbyId: z.number().int().nonnegative().optional(),
        nonce: z.number().optional(),
        urls: z.array(z.string().url()).optional(),
        userId: z.number().int().positive().optional(),
      } satisfies ComputeToZodKeys<ChatsModel.DTO.NewMessage['meta']>)
      .required() as z.ZodObject<NonNullable<unknown>>,
    type: z.enum(
      [
        ChatsModel.Models.ChatMessageType.Embed,
        ChatsModel.Models.ChatMessageType.Normal,
      ],
      {
        description: 'Chat message type',
      },
    ),
  } satisfies Omit<ComputeToZodKeys<ChatsModel.DTO.NewMessage>, 'meta'> & {
    meta: z.ZodObject<NonNullable<unknown>>;
  });

  // ChatsModel.Endpoints.Targets.UpdateChatInfo
  updateChatInfoSchema: ZodType<ChatsModel.DTO.DB.UpdateChatInfo> = z.object({
    authorization: z
      .enum(
        [
          ChatsModel.Models.ChatAccess.Public,
          ChatsModel.Models.ChatAccess.Private,
          ChatsModel.Models.ChatAccess.Protected,
        ],
        {
          description: 'Chat authorization type',
        },
      )
      .optional(),
    authorizationData: z
      .object({
        password: z.string().max(50, {
          message: 'Chat password cannot be more than 50 characters',
        }),
      })
      .nullable()
      .optional(),
    name: z
      .string()
      .min(3)
      .max(50, {
        message: 'Chat name must be between 3 and 50 characters',
      })
      .optional(),
    photo: z
      .string()
      .url()
      .nullable()
      .optional() as unknown as z.ZodNullable<z.ZodString>,
    topic: z
      .string()
      .max(200, {
        message: 'Chat topic cannot be more than 200 characters',
      })
      .optional(),
  } satisfies ComputeToZodKeys<ChatsModel.DTO.DB.UpdateChatInfo>);

  // ChatsModel.Endpoints.Targets.UpdateParticipant
  updateParticipantSchema: ZodType<ChatsModel.DTO.DB.UpdateParticipant> =
    z.object({
      role: z
        .enum(
          [
            ChatsModel.Models.ChatParticipantRole.Admin,
            ChatsModel.Models.ChatParticipantRole.Member,
            ChatsModel.Models.ChatParticipantRole.Owner,
          ],
          {
            description: 'Chat participant role',
          },
        )
        .optional(),
      muted: z
        .enum(
          [
            ChatsModel.Models.ChatParticipantMuteType.No,
            ChatsModel.Models.ChatParticipantMuteType.Forever,
            ChatsModel.Models.ChatParticipantMuteType.Until,
          ],
          {
            description: 'Chat participant mute state',
          },
        )
        .optional(),
      mutedUntil: z.number().int().positive().nullable().optional(),
      toReadPings: z.number().int().nonnegative().optional(),
    } satisfies ComputeToZodKeys<ChatsModel.DTO.DB.UpdateParticipant>);

  // ChatsModel.Endpoints.Targets.SendInviteToTargets
  sendInviteToTargetsSchema: ZodType<ChatsModel.DTO.SendInviteToTarget[]> =
    z.array(
      z.object({
        id: z.number().int().positive(),
        type: z.enum(['user', 'chat'], {
          description: 'Target Type',
        }),
      } satisfies ComputeToZodKeys<ChatsModel.DTO.SendInviteToTarget>),
    );

  // ChatsModel.Endpoints.Targets.JoinChat
  joinChatSchema: ZodType<ChatsModel.DTO.JoinChat> = z.object({
    password: z
      .string()
      .max(50, {
        message: 'Chat password cannot be more than 50 characters',
      })
      .optional(),
    messageData: z
      .object({
        id: z.number().int().positive(),
        nonce: z.string(),
      })
      .optional(),
    returnChatInfo: z.boolean().optional(),
  } satisfies ComputeToZodKeys<ChatsModel.DTO.JoinChat>);
})();

export default chatValidator;

import { ComputeToZodKeys } from '@/helpers/decorators/validator';
import ChatsModel from '@typings/models/chat';
import { ZodType, z } from 'zod';

const chatValidator = new (class ChatControllerValidator {
  newChatSchema: ZodType<ChatsModel.DTO.NewChat> = z.object({
    type: z.enum([ChatsModel.Models.ChatType.Group], {
      description: 'Chat type',
    }),
    name: z.string().min(3).length(50, {
      message: 'Chat name must be between 3 and 50 characters',
    }),
    topic: z.string().length(200, {
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
        password: z.string().length(50, {
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
})();

export default chatValidator;

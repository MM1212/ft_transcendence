import { ComputeToZodKeys } from '@/helpers/decorators/validator';
import UsersModel from '@typings/models/users';
import { ZodType, z } from 'zod';

const usersValidator = new (class UsersValidator {
  patchUserSchema: ZodType<UsersModel.DTO.PatchUser> = z.object({
    avatar: z
      .string()
      .refine(
        (v) => {
          const n = Number(v);
          return !isNaN(n) && v?.length > 0 && n > 0;
        },
        { message: 'Invalid number' },
      )
      .or(z.string().url()),
    nickname: z
      .string()
      .min(1)
      .max(10)
      .refine((s) => !s.includes(' '), {
        message: 'Invalid nickname',
      }),
    status: z.enum(
      [
        UsersModel.Models.Status.Away,
        UsersModel.Models.Status.Busy,
        UsersModel.Models.Status.Offline,
        UsersModel.Models.Status.Online,
      ],
      {
        description: 'User status',
      },
    ),
    firstLogin: z.boolean(),
  } satisfies ComputeToZodKeys<UsersModel.DTO.PatchUser>);
})();

export default usersValidator;

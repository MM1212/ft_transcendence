import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodError, ZodSchema, z } from 'zod';

export class ObjectValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError)
        throw new BadRequestException(`Validation failed: ${error.issues.map(issue => `'${issue.path}' ${issue.message}`).join('. ')}`);
      throw new BadRequestException('Validation failed');
    }
  }
}

export type ComputeToZodKeys<T> = {
  [K in keyof T]: T[K] extends any[]
    ? z.ZodType<T[K]>
    : T[K] extends object
    ? ComputeToZodKeys<T[K]>
    : z.ZodType<T[K]>;
};

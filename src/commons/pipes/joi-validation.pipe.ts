import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ObjectSchema } from 'joi';

export class JoiValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: ObjectSchema,
    private readonly contextMessage = 'Payload tidak valied',
  ) {}

  transform(value: unknown) {
    const { error, value: validatedValue } = this.schema.validate(value, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      throw new BadRequestException({
        status: 'failed',
        message: this.contextMessage,
      });
    }

    return validatedValue;
  }
}

import { HttpStatus } from '@nestjs/common';
import { ClientError } from './ClientError';

export class NotFoundError extends ClientError {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

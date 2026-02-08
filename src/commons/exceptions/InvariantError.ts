import { HttpStatus } from '@nestjs/common';
import { ClientError } from './ClientError';

export class InvariantError extends ClientError {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

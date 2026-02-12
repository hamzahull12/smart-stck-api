import { HttpStatus } from '@nestjs/common';
import { ClientError } from './ClientError';

export class AuthenticationError extends ClientError {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

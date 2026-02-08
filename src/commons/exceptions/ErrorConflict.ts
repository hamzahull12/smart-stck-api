import { HttpStatus } from '@nestjs/common';
import { ClientError } from './ClientError';

export class ErrorConflict extends ClientError {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT);
  }
}

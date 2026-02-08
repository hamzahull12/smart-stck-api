import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponse } from './error-response.interface';

export class ClientError extends HttpException {
  constructor(message: string, statusCode: HttpStatus) {
    const response: ErrorResponse = {
      status: 'failed',
      message,
    };

    super(response, statusCode);
  }
}

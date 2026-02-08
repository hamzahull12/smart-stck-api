import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Kalau error dari HttpException (ClientError, BadRequest, dll)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      response.status(status).json(res);
      return;
    }

    // Selain itu → 500
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Terjadi kegagalan pada server',
    });
  }
}

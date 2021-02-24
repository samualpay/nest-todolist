import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private logger: PinoLogger) {
    logger.setContext(AllExceptionsFilter.name);
  }
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let status = 400;
    let message = exception.message;
    let stack = '';
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      this.logger.warn({ message });
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      stack = exception.stack;
      this.logger.error({ message, stack });
    }
    response.status(status).json({
      statusCode: status,
      message,
      stack,
    });
  }
}

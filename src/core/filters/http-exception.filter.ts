// the purpose of this filter to catch all the other errors which are not http errors.
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AppLogger } from '../logger/app-logger';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {
    logger.setContext('ExceptionFilter');
  }

  catch(exception: HttpException, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest<Request>();
    const code =
      exception instanceof HttpException
        ? exception?.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.message
        : 'An internal server error occurred';

    // logging the error
    this.logger.error(
      JSON.stringify({
        code,
        message: message,
        path: request.url,
        stack: exception.message,
        stackDetails: exception.stack,
      }),
    );

    response.status(code).json({
      statusCode: code,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      success: false,
      message: message,
      detail: exception.message,
      error: HttpStatus[code],
    });
  }
}

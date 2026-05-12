import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message ?? message;
    } else if (exception instanceof Error) {
      message = exception.message;

      if (exception.name === 'CategoryNotFoundException' ||
          exception.name === 'ProductNotFoundException' ||
          exception.name === 'CustomerNotFoundException' ||
          exception.name === 'SupplierNotFoundException' ||
          exception.name === 'InventoryItemNotFoundException' ||
          exception.name === 'OrderNotFoundException' ||
          exception.name === 'ProductVariantNotFoundException') {
        status = HttpStatus.NOT_FOUND;
      } else if (
          exception.name === 'CategoryAlreadyExistsException' ||
          exception.name === 'CustomerAlreadyExistsException' ||
          exception.name === 'ProductNotActiveException' ||
          exception.name === 'CustomerNotActiveException' ||
          exception.name === 'OrderNotPendingException' ||
          exception.name === 'InsufficientStockException') {
        status = HttpStatus.BAD_REQUEST;
      }
    }

    response.status(status).json({
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
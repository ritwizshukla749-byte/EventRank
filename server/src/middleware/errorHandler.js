import { AppError } from '../utils/errors.js';
import { errorResponse } from '../utils/response.js';
import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Handled application errors
  if (err instanceof AppError) {
    return errorResponse(res, err.code, err.message, err.details, err.statusCode);
  }

  // Zod request validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 'VALIDATION_ERROR', 'Request validation failed', details, 400);
  }

  // JSON syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'INVALID_JSON', 'Malformed JSON in request body', [], 400);
  }

  // Unhandled errors
  console.error('Unhandled server error:', err);
  const isDev = process.env.NODE_ENV === 'development';
  return errorResponse(
    res,
    'INTERNAL_SERVER_ERROR',
    isDev ? err.message : 'An unexpected internal error occurred',
    isDev && err.stack ? [err.stack] : [],
    500
  );
}

export function notFoundHandler(req, res) {
  return errorResponse(
    res,
    'ROUTE_NOT_FOUND',
    `Cannot ${req.method} ${req.originalUrl}`,
    [],
    404
  );
}

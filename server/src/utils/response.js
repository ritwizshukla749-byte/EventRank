/**
 * Builds a standardized API response adhering to docs/API_CONTRACT.md
 */

export function successResponse(res, data = {}, meta = {}, statusCode = 200) {
  return res.status(statusCode).json({
    data,
    meta,
  });
}

export function errorResponse(res, code = 'INTERNAL_ERROR', message = 'An error occurred', details = [], statusCode = 500) {
  return res.status(statusCode).json({
    error: {
      code,
      message,
      details,
    },
  });
}

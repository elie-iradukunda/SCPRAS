import { env } from '../config/env.js';
import { handleDemoFallback } from '../data/demoStore.js';
import { isDatabaseUnavailable } from '../utils/databaseFallback.js';

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (env.demoMode && isDatabaseUnavailable(error)) {
    const handled = handleDemoFallback(req, res);
    if (handled !== false) return undefined;
  }

  const status = error.status || 500;
  return res.status(status).json({
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  });
}

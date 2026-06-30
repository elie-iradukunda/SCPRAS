import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication token required.' });
    }
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        message: `Your ${String(req.user.role).replace(/_/g, ' ')} role is not permitted to perform this action.`,
      });
    }
    return next();
  };
}

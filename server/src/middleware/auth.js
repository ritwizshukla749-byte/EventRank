import { verifyToken } from '../utils/token.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { User } from '../models/index.js';

export async function authenticate(req, res, next) {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('Authentication token is required'));
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return next(new UnauthorizedError('Invalid or expired authentication token'));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new UnauthorizedError('User account not found'));
  }

  if (user.status !== 'active') {
    return next(new ForbiddenError('User account is suspended'));
  }

  req.user = user;
  next();
}

export async function optionalAuthenticate(req, res, next) {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  const decoded = verifyToken(token);
  if (decoded && decoded.id) {
    const user = await User.findById(decoded.id);
    if (user && user.status === 'active') {
      req.user = user;
    }
  }

  next();
}

/**
 * Enforce platform-wide global role (e.g. platform_admin)
 */
export function requireGlobalRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!allowedRoles.includes(req.user.globalRole)) {
      return next(new ForbiddenError('Platform administrator privilege required'));
    }
    next();
  };
}

/**
 * Enforce college-scoped role (e.g. college_admin, organizer, student)
 */
export function requireCollegeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // Platform admin bypasses college-role checks
    if (req.user.globalRole === 'platform_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.collegeRole)) {
      return next(
        new ForbiddenError(`Required role: ${allowedRoles.join(' or ')}`)
      );
    }
    next();
  };
}

/**
 * Enforce college boundary: ensures that a college admin or organizer can only operate
 * within their assigned institution. Platform admins bypass this restriction.
 */
export function requireCollegeScope(getCollegeIdFromReq) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // Platform admins have platform-wide scope
    if (req.user.globalRole === 'platform_admin') {
      return next();
    }

    const targetCollegeId = getCollegeIdFromReq(req);
    if (!targetCollegeId) {
      return next(new ForbiddenError('Target college ID is missing'));
    }

    const userCollegeId = req.user.collegeId ? req.user.collegeId.toString() : null;
    const requestedId = targetCollegeId.toString();

    if (userCollegeId !== requestedId) {
      return next(
        new ForbiddenError(
          'College scope violation: access denied to another institution’s records'
        )
      );
    }

    next();
  };
}

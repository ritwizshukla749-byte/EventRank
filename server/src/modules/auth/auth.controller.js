import { User, College } from '../../models/index.js';
import { AppError, UnauthorizedError, ValidationError } from '../../utils/errors.js';
import { successResponse } from '../../utils/response.js';
import { signToken } from '../../utils/token.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req, res, next) {
  try {
    const { email, password, collegeId, ...rest } = req.body;

    // Validate college exists and is active
    const college = await College.findById(collegeId);
    if (!college) {
      throw new ValidationError('Selected college does not exist');
    }
    if (college.status !== 'active') {
      throw new ValidationError('Selected college is not active for new registrations');
    }

    // Check duplicate email
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError('Email address is already registered', 409, 'DUPLICATE_EMAIL');
    }

    // Hash password and save user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      collegeId: college._id,
      ...rest,
    });

    const token = signToken({
      id: user._id,
      email: user.email,
      globalRole: user.globalRole,
      collegeRole: user.collegeRole,
      collegeId: user.collegeId,
    });

    res.cookie('token', token, COOKIE_OPTIONS);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return successResponse(res, { user: userObj, token }, {}, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new AppError('Account is suspended', 403, 'ACCOUNT_SUSPENDED');
    }

    const token = signToken({
      id: user._id,
      email: user.email,
      globalRole: user.globalRole,
      collegeRole: user.collegeRole,
      collegeId: user.collegeId,
    });

    res.cookie('token', token, COOKIE_OPTIONS);

    const userObj = user.toObject();
    delete userObj.passwordHash;

    return successResponse(res, { user: userObj, token });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('token');
  return successResponse(res, { message: 'Logged out successfully' });
}

export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate('collegeId', 'name slug status');
    return successResponse(res, { user });
  } catch (err) {
    next(err);
  }
}

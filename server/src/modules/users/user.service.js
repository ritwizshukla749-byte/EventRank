import { User } from '../../models/index.js';
import { NotFoundError } from '../../utils/errors.js';
import { listForUser as listRegistrationsForUser } from '../registrations/registration.service.js';

/**
 * Fields a student may update about their own profile.
 * Deliberately excludes identity, email, role, and college-association fields.
 */
const UPDATE_WHITELIST = [
  'name',
  'department',
  'academicYear',
  'interests',
  'skills',
  'experienceLevel',
  'preferredEventTypes',
  'budgetMax',
  'privacyPreferences',
];

export async function updateUserProfile(userId, payload) {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  for (const field of UPDATE_WHITELIST) {
    if (payload[field] !== undefined) {
      user[field] = payload[field];
    }
  }

  await user.save();
  return { user };
}

export async function getMyRegistrations(userId) {
  return listRegistrationsForUser(userId);
}
import { Organizer, Event, EventEdition, College } from '../../models/index.js';
import { NotFoundError, ForbiddenError } from '../../utils/errors.js';

export async function listOrganizers(query = {}) {
  const filter = { status: 'approved' };
  if (query.collegeId) {
    filter.collegeId = query.collegeId;
  }

  const organizers = await Organizer.find(filter)
    .populate('collegeId', 'name slug city')
    .select('name type description collegeId status createdAt');

  return { organizers };
}

export async function getOrganizerProfileAndHistory(organizerId) {
  const organizer = await Organizer.findById(organizerId).populate(
    'collegeId',
    'name slug city region website'
  );

  if (!organizer) {
    throw new NotFoundError('Organizer not found');
  }

  // Find all event series strictly owned by this specific organizer ID
  const events = await Event.find({ organizerId: organizer._id }).select(
    'title description eventType tags status'
  );
  const eventIds = events.map((e) => e._id);

  // Find editions for these events
  const editions = await EventEdition.find({ eventId: { $in: eventIds } })
    .sort({ startAt: -1 })
    .select('editionLabel startAt endAt venue status costAmount currency eventId');

  const completedEditions = editions.filter((ed) => ed.status === 'completed');
  const upcomingEditions = editions.filter((ed) => ed.status === 'published');

  return {
    organizer: {
      _id: organizer._id,
      name: organizer.name,
      type: organizer.type,
      description: organizer.description,
      hostCollege: organizer.collegeId,
      status: organizer.status,
      metrics: {
        totalEventsCreated: events.length,
        completedEditionsCount: completedEditions.length,
        upcomingEditionsCount: upcomingEditions.length,
      },
      events,
      recentEditions: editions.slice(0, 10),
    },
  };
}

export async function getOrganizerForUser(user) {
  if (user.globalRole === 'platform_admin') {
    throw new NotFoundError(
      'Platform administrators are not bound to a specific organizer'
    );
  }

  const memberOrganizer = await Organizer.findOne({
    authorizedUserIds: user._id,
    status: 'approved',
  }).populate('collegeId', 'name slug city');

  if (memberOrganizer) {
    return { organizer: toOrganizerView(memberOrganizer) };
  }

  // College admins may act on behalf of any approved organizer at their college
  if (user.collegeRole === 'college_admin' && user.collegeId) {
    const collegeOrganizer = await Organizer.findOne({
      collegeId: user.collegeId,
      status: 'approved',
    }).populate('collegeId', 'name slug city');

    if (collegeOrganizer) {
      return { organizer: toOrganizerView(collegeOrganizer) };
    }
  }

  throw new NotFoundError('No organizer profile is associated with your account');
}

function toOrganizerView(organizer) {
  const { collegeId, ...organizerView } = organizer.toObject();
  return { ...organizerView, hostCollege: collegeId };
}

export async function updateOrganizerProfile(organizerId, user, payload) {
  const organizer = await Organizer.findById(organizerId);
  if (!organizer) {
    throw new NotFoundError('Organizer not found');
  }

  // Authorization check
  const isAuthorized =
    user.globalRole === 'platform_admin' ||
    (user.collegeRole === 'college_admin' && user.collegeId?.toString() === organizer.collegeId.toString()) ||
    organizer.authorizedUserIds.some((id) => id.toString() === user._id.toString());

  if (!isAuthorized) {
    throw new ForbiddenError('You are not authorized to update this organizer profile');
  }

  const allowedFields = ['description', 'type'];
  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      organizer[field] = payload[field];
    }
  }

  await organizer.save();
  return { organizer };
}

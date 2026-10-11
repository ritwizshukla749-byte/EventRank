import { Event, EventEdition, College, Organizer, Registration } from '../../models/index.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../../utils/errors.js';

export async function listPublishedEvents(query) {
  const {
    q,
    collegeId,
    type,
    tags,
    from,
    to,
    minCost,
    maxCost,
    sort = 'upcoming',
    page = 1,
    limit = 10,
  } = query;

  // Base filter for editions: published status
  const editionFilter = { status: 'published' };

  if (collegeId) {
    editionFilter.collegeId = collegeId;
  }

  if (from || to) {
    editionFilter.startAt = {};
    if (from) editionFilter.startAt.$gte = new Date(from);
    if (to) editionFilter.startAt.$lte = new Date(to);
  }

  if (minCost !== undefined || maxCost !== undefined) {
    editionFilter.costAmount = {};
    if (minCost !== undefined) editionFilter.costAmount.$gte = minCost;
    if (maxCost !== undefined) editionFilter.costAmount.$lte = maxCost;
  }

  // Filter on base Event fields if query string, type, or tags are provided
  if (q || type || tags) {
    const eventMatch = {};
    if (type) eventMatch.eventType = type;
    if (tags) {
      const tagList = tags.split(',').map((t) => t.trim().toLowerCase());
      eventMatch.tags = { $in: tagList };
    }
    if (q) {
      const regex = new RegExp(q.trim(), 'i');
      eventMatch.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    const matchingEvents = await Event.find(eventMatch).select('_id');
    const eventIds = matchingEvents.map((e) => e._id);
    editionFilter.eventId = { $in: eventIds };
  }

  // Sorting logic
  let sortOption = { startAt: 1 };
  if (sort === 'cost_asc') sortOption = { costAmount: 1, startAt: 1 };
  if (sort === 'cost_desc') sortOption = { costAmount: -1, startAt: 1 };
  if (sort === 'date_desc') sortOption = { startAt: -1 };

  const skip = (page - 1) * limit;

  // Execute query and count
  const [editions, total] = await Promise.all([
    EventEdition.find(editionFilter)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'eventId',
        select: 'title description eventType tags prerequisites expectedOutcomes organizerId',
        populate: {
          path: 'organizerId',
          select: 'name type description collegeId',
        },
      })
      .populate('collegeId', 'name slug city region status'),
    EventEdition.countDocuments(editionFilter),
  ]);

  // Aggregate registration counts for these editions
  const editionIds = editions.map((e) => e._id);
  const regCounts = await Registration.aggregate([
    { $match: { eventEditionId: { $in: editionIds }, status: 'registered' } },
    { $group: { _id: '$eventEditionId', count: { $sum: 1 } } },
  ]);

  const countMap = new Map(regCounts.map((r) => [r._id.toString(), r.count]));

  const formattedEvents = editions.map((ed) => {
    const event = ed.eventId || {};
    const organizer = event.organizerId || {};
    const hostCollege = ed.collegeId || {};

    return {
      _id: ed._id,
      editionLabel: ed.editionLabel,
      event: {
        _id: event._id,
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        tags: event.tags || [],
      },
      hostCollege: {
        _id: hostCollege._id,
        name: hostCollege.name,
        slug: hostCollege.slug,
        city: hostCollege.city,
      },
      organizer: {
        _id: organizer._id,
        name: organizer.name,
        type: organizer.type,
      },
      eligibility: ed.eligibility,
      startAt: ed.startAt,
      endAt: ed.endAt,
      timezone: ed.timezone,
      venue: ed.venue,
      costAmount: ed.costAmount,
      currency: ed.currency,
      capacity: ed.capacity,
      registrationCount: countMap.get(ed._id.toString()) || 0,
      status: ed.status,
    };
  });

  return {
    events: formattedEvents,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getEventEditionDetails(editionId, currentUserId = null) {
  const edition = await EventEdition.findById(editionId)
    .populate({
      path: 'eventId',
      populate: {
        path: 'organizerId',
        select: 'name type description collegeId',
      },
    })
    .populate('collegeId', 'name slug city region website status')
    .populate('allowedCollegeIds', 'name slug');

  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  // Authoritative registration count
  const registrationCount = await Registration.countDocuments({
    eventEditionId: edition._id,
    status: 'registered',
  });

  // Check if current user is registered
  let isRegistered = false;
  let userRegistration = null;

  if (currentUserId) {
    userRegistration = await Registration.findOne({
      eventEditionId: edition._id,
      userId: currentUserId,
      status: 'registered',
    });
    isRegistered = !!userRegistration;
  }

  return {
    edition: {
      _id: edition._id,
      editionLabel: edition.editionLabel,
      eligibility: edition.eligibility,
      allowedColleges: edition.allowedCollegeIds || [],
      startAt: edition.startAt,
      endAt: edition.endAt,
      timezone: edition.timezone,
      venue: edition.venue,
      costAmount: edition.costAmount,
      currency: edition.currency,
      capacity: edition.capacity,
      registrationMode: edition.registrationMode,
      externalRegistrationUrl: edition.externalRegistrationUrl,
      status: edition.status,
      registrationCount,
      isRegistered,
      event: edition.eventId,
      hostCollege: edition.collegeId,
    },
  };
}

export async function createEventAndEdition(user, payload) {
  const {
    title,
    description,
    organizerId,
    eventType,
    tags,
    prerequisites,
    expectedOutcomes,
    editionLabel,
    eligibility,
    allowedCollegeIds,
    startAt,
    endAt,
    timezone,
    venue,
    costAmount,
    currency,
    capacity,
  } = payload;

  const organizer = await Organizer.findById(organizerId);
  if (!organizer) {
    throw new NotFoundError('Organizer not found');
  }

  // Authorization check: User must be an authorized member of organizer OR college admin of that college
  const isAuthorized =
    user.globalRole === 'platform_admin' ||
    (user.collegeRole === 'college_admin' && user.collegeId?.toString() === organizer.collegeId.toString()) ||
    organizer.authorizedUserIds.some((id) => id.toString() === user._id.toString());

  if (!isAuthorized) {
    throw new ForbiddenError('You are not authorized to create events for this organizer');
  }

  // Validate college is active
  const college = await College.findById(organizer.collegeId);
  if (!college || college.status !== 'active') {
    throw new ValidationError('Host college is inactive or suspended');
  }

  // Create base event
  const baseEvent = await Event.create({
    title,
    description,
    organizerId: organizer._id,
    collegeId: organizer.collegeId,
    eventType,
    tags: tags.map((t) => t.toLowerCase().trim()),
    prerequisites,
    expectedOutcomes,
    createdBy: user._id,
    status: 'active',
  });

  // Create scheduled edition
  const edition = await EventEdition.create({
    eventId: baseEvent._id,
    collegeId: organizer.collegeId,
    editionLabel,
    eligibility,
    allowedCollegeIds,
    startAt: new Date(startAt),
    endAt: new Date(endAt),
    timezone,
    venue,
    costAmount,
    currency,
    capacity,
    status: 'published',
  });

  return { event: baseEvent, edition };
}

export async function compareEvents(editionIds) {
  if (!Array.isArray(editionIds) || editionIds.length === 0 || editionIds.length > 3) {
    throw new ValidationError('You can compare between 1 and 3 events');
  }

  const editions = await EventEdition.find({ _id: { $in: editionIds } })
    .populate({
      path: 'eventId',
      populate: { path: 'organizerId', select: 'name type' },
    })
    .populate('collegeId', 'name slug city');

  // Compute registration counts
  const regCounts = await Registration.aggregate([
    { $match: { eventEditionId: { $in: editions.map((e) => e._id) }, status: 'registered' } },
    { $group: { _id: '$eventEditionId', count: { $sum: 1 } } },
  ]);
  const countMap = new Map(regCounts.map((r) => [r._id.toString(), r.count]));

  // Return normalized comparison matrix rows
  const comparison = editions.map((ed) => ({
    _id: ed._id,
    title: ed.eventId?.title || 'Unknown Event',
    hostCollege: ed.collegeId?.name || 'Unknown Institution',
    editionLabel: ed.editionLabel,
    eventType: ed.eventId?.eventType || 'other',
    venue: ed.venue,
    startAt: ed.startAt,
    cost: ed.costAmount === 0 ? 'Free' : `${ed.currency} ${ed.costAmount}`,
    eligibility: ed.eligibility,
    registrationCount: countMap.get(ed._id.toString()) || 0,
    tags: ed.eventId?.tags || [],
    expectedOutcomes: ed.eventId?.expectedOutcomes || [],
    organizer: ed.eventId?.organizerId?.name || 'Unknown Organizer',
  }));

  return { comparison };
}

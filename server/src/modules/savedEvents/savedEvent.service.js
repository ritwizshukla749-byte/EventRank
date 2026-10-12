import SavedEvent from './savedEvent.model.js';
import { EventEdition, Event, College } from '../../models/index.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';

/**
 * List all saved events for a user with full event details
 */
export async function listUserSavedEvents(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  
  // Get saved events with population
  const savedEvents = await SavedEvent.find({ userId })
    .sort({ savedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'editionId',
      select: 'title startAt venue costAmount currency registrationCount status eventId collegeId',
      match: { status: { $ne: 'cancelled' } }, // Exclude cancelled editions
      populate: [
        {
          path: 'eventId',
          select: 'title description eventType tags organizerId',
          populate: {
            path: 'organizerId',
            select: 'name type',
          },
        },
        {
          path: 'collegeId',
          select: 'name slug',
        },
      ],
    })
    .lean();

  // Filter out saved events where edition was deleted or cancelled
  const validSavedEvents = savedEvents.filter(se => se.editionId != null);

  // Get total count
  const total = await SavedEvent.countDocuments({ userId });

  return {
    savedEvents: validSavedEvents,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Save an event (bookmark)
 */
export async function saveEvent(userId, editionId) {
  // Verify edition exists and is not cancelled
  const edition = await EventEdition.findById(editionId).select('status startAt');
  
  if (!edition) {
    throw new NotFoundError('Event edition not found');
  }

  if (edition.status === 'cancelled') {
    throw new ValidationError('Cannot save a cancelled event');
  }

  // Check if event has already occurred
  if (edition.startAt && new Date(edition.startAt) < new Date()) {
    throw new ValidationError('Cannot save a past event');
  }

  // Try to create saved event (idempotent - returns existing if already saved)
  try {
    const savedEvent = await SavedEvent.findOneAndUpdate(
      { userId, editionId },
      { userId, editionId, savedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { savedEvent };
  } catch (error) {
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      const existing = await SavedEvent.findOne({ userId, editionId });
      return { savedEvent: existing };
    }
    throw error;
  }
}

/**
 * Remove saved event (unbookmark)
 */
export async function removeSavedEvent(userId, editionId) {
  // Idempotent - doesn't error if not found
  await SavedEvent.deleteOne({ userId, editionId });
  
  return { message: 'Event removed from saved list' };
}

/**
 * Check if event is saved by user
 */
export async function checkSavedStatus(userId, editionId) {
  const savedEvent = await SavedEvent.findOne({ userId, editionId }).select('savedAt').lean();
  
  return {
    isSaved: !!savedEvent,
    editionId,
    ...(savedEvent && { savedAt: savedEvent.savedAt }),
  };
}

/**
 * Batch check saved status for multiple events
 */
export async function batchCheckSavedStatus(userId, editionIds) {
  if (!Array.isArray(editionIds) || editionIds.length === 0) {
    return { savedStatus: {} };
  }

  if (editionIds.length > 100) {
    throw new ValidationError('Maximum 100 edition IDs allowed per batch request');
  }

  // Query all saved events for this user matching any of the edition IDs
  const savedEvents = await SavedEvent.find({
    userId,
    editionId: { $in: editionIds },
  })
    .select('editionId')
    .lean();

  // Create a Set of saved edition IDs for O(1) lookup
  const savedEditionIds = new Set(
    savedEvents.map(se => se.editionId.toString())
  );

  // Build response object with all edition IDs (default to false)
  const savedStatus = {};
  editionIds.forEach(id => {
    savedStatus[id] = savedEditionIds.has(id.toString());
  });

  return { savedStatus };
}

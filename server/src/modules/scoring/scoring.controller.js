import { getScoredEventEdition } from './scoring.service.js';
import { successResponse } from '../../utils/response.js';

export async function getEventScores(req, res, next) {
  try {
    const currentStudentUser = req.user || null;
    const result = await getScoredEventEdition(req.params.id, currentStudentUser);

    return successResponse(res, {
      eventEditionId: result.edition._id,
      title: result.edition.eventId?.title,
      hostCollege: {
        _id: result.edition.collegeId?._id,
        name: result.edition.collegeId?.name,
        slug: result.edition.collegeId?.slug,
      },
      // INVARIANT: Event Quality and Fit for You returned as strictly distinct score concepts
      eventQuality: result.eventQuality,
      fitForYou: result.fitForYou,
      preEventSignals: result.preEventSignals,
    });
  } catch (err) {
    next(err);
  }
}

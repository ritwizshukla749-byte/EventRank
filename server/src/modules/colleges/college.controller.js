import { College } from '../../models/index.js';
import { successResponse } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';

export async function listActiveColleges(req, res, next) {
  try {
    const colleges = await College.find({ status: 'active' }).select('name slug city region website status');
    return successResponse(res, { colleges });
  } catch (err) {
    next(err);
  }
}

export async function getCollegeById(req, res, next) {
  try {
    const college = await College.findById(req.params.collegeId);
    if (!college) {
      throw new NotFoundError('College not found');
    }
    return successResponse(res, { college });
  } catch (err) {
    next(err);
  }
}

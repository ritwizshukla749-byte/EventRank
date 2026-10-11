import { Router } from 'express';
import { listActiveColleges, getCollegeById } from './college.controller.js';

const router = Router();

router.get('/', listActiveColleges);
router.get('/:collegeId', getCollegeById);

export default router;

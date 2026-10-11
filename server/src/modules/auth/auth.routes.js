import { Router } from 'express';
import { register, login, logout, getMe } from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/register', validateRequest({ body: registerSchema }), register);
router.post('/login', validateRequest({ body: loginSchema }), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;

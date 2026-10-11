import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import collegeRoutes from './modules/colleges/college.routes.js';
import eventRoutes from './modules/events/event.routes.js';
import organizerRoutes from './modules/organizers/organizer.routes.js';
import registrationRoutes from './modules/registrations/registration.routes.js';
import { compare } from './modules/events/event.controller.js';
import { validateRequest } from './middleware/validate.js';
import { compareEventsSchema } from './modules/events/event.validation.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Security HTTP headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.clientOrigin,
      credentials: true,
    })
  );

  // Request body and cookie parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // API v1 routes
  const apiRouter = express.Router();
  apiRouter.use(healthRoutes);
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/colleges', collegeRoutes);
  apiRouter.use('/events', eventRoutes);
  apiRouter.use('/organizers', organizerRoutes);
  apiRouter.use('/event-editions', registrationRoutes);
  apiRouter.post('/compare', validateRequest({ body: compareEventsSchema }), compare);

  // Mount API router
  app.use('/api/v1', apiRouter);

  // 404 handler for unmapped routes
  app.use(notFoundHandler);

  // Central error handling middleware
  app.use(errorHandler);

  return app;
}

export default createApp();

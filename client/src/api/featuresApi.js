import { apiClient } from './client';

export const scoringApi = {
  // GET /scoring/events/:id -> { eventQuality, fitForYou }
  getScore: (editionId) => apiClient(`/scoring/events/${editionId}`),
};

export const compareApi = {
  // POST /compare -> { comparison: [...] }
  compare: (editionIds) =>
    apiClient('/compare', {
      method: 'POST',
      body: JSON.stringify({ editionIds }),
    }),
};

export const collegesApi = {
  list: () => apiClient('/colleges'),
  getById: (id) => apiClient(`/colleges/${id}`),
};

export const organizersApi = {
  // GET /organizers/me -> { organizer: { _id, name, type, hostCollege, ... } }
  me: () => apiClient('/organizers/me'),
};

export const registrationsApi = {
  register: (editionId) =>
    apiClient(`/event-editions/${editionId}/registrations`, {
      method: 'POST',
    }),

  cancel: (editionId) =>
    apiClient(`/event-editions/${editionId}/registrations/me`, {
      method: 'DELETE',
    }),

  getStatus: (editionId) =>
    apiClient(`/event-editions/${editionId}/registration-status`),

  // GET /users/me/registrations -> { registrations: [...] }
  mine: () => apiClient('/users/me/registrations'),

  // GET /event-editions/:id/signals -> { signals: {...} }
  getSignals: (editionId) => apiClient(`/event-editions/${editionId}/signals`),
};

export const attendanceApi = {
  generateToken: (editionId) =>
    apiClient(`/event-editions/${editionId}/check-in-token`, {
      method: 'POST',
    }),

  // Server expects the dynamic single-use token under method:'dynamic_token'
  checkIn: (editionId, token) =>
    apiClient(`/event-editions/${editionId}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ method: 'dynamic_token', token }),
    }),

  verifyStudent: (editionId, studentId) =>
    apiClient(`/event-editions/${editionId}/attendance/${studentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ method: 'organizer_checkin', evidenceReference: 'ORGANIZER_ROSTER' }),
    }),

  getStatus: (editionId) =>
    apiClient(`/event-editions/${editionId}/attendance/me`),
};

export const reviewsApi = {
  list: (editionId) => apiClient(`/event-editions/${editionId}/reviews`),

  // -> { isEligible, ineligibilityReason, ... }
  checkEligibility: (editionId) =>
    apiClient(`/event-editions/${editionId}/reviews/eligibility`),

  // Post verified-attendee review: { dimensions: { organization, contentValue, networking, timeCostValue }, text }
  submit: (editionId, reviewData) =>
    apiClient(`/event-editions/${editionId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),
};
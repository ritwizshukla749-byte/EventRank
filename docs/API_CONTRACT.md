# REST API Contract (Proposed)

Base path: `/api/v1`. JSON request and response bodies unless noted.
Exact schemas should be implemented consistently and reflected in tests.

## Response conventions

Success:

``` json
{
  "data": {},
  "meta": {}
}
```

Error:

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request could not be validated.",
    "details": []
  }
}
```

Never return password hashes, tokens in logs, attendance evidence, or
private peer identities.

## Authentication

-   `POST /auth/register` --- create student account and associate it with an active college through the approved onboarding/verification flow.
-   `POST /auth/login` --- authenticate.
-   `POST /auth/logout` --- invalidate session/refresh token if that
    strategy is used.
-   `GET /auth/me` --- current user, college association, scoped memberships, and permitted profile fields.
-   `PATCH /users/me` --- update editable profile fields.

Token/session strategy must be selected and documented before
implementation. Do not store long-lived bearer tokens in insecure
browser storage by default.

## Colleges

- `GET /colleges` --- list active participating colleges for discovery and onboarding.
- `GET /colleges/:collegeId` --- public college profile/metadata.
- `POST /admin/colleges` --- platform-admin-only college creation/onboarding.
- `PATCH /admin/colleges/:collegeId/status` --- platform-admin-only status change.

## Events

-   `GET /events` --- search/filter/sort/paginate published editions.
    -   Query examples: `q`, `collegeId` (single), `collegeIds` (if supported), `type`, `tags`, `from`, `to`, `minCost`, `maxCost`, `sort`, `page`, `limit`. Cross-college discovery is the default for eligible published events; filters narrow it.
    -   Personalized sort requires authenticated profile data.
-   `GET /events/:eventEditionId` --- details, both scores, score
    explanation, pre-event signals.
-   `POST /events` --- create event/edition according to role, host college, and approval policy. The server validates that the organizer and host-college relationship is authorized.
-   `PATCH /events/:eventEditionId` --- update owned/authorized event
    before completion.
-   `POST /events/:eventEditionId/cancel` --- authorized cancellation
    action.
-   `GET /events/:eventEditionId/compare-data` --- normalized comparison
    attributes, if useful.

## Organizers

-   `GET /organizers` --- list approved organizers; optionally filter by `collegeId`.
-   `GET /organizers/:organizerId` --- profile and public historical
    summary.
-   `POST /organizers` --- submit organizer request, if self-service is
    enabled.
-   `PATCH /organizers/:organizerId` --- authorized update only.

## Registration and peer signals

-   `POST /event-editions/:id/registrations` --- register current user.
-   `DELETE /event-editions/:id/registrations/me` --- cancel current
    user's registration.
-   `GET /event-editions/:id/registration-status` --- current user's
    status and permitted aggregate counts.
-   `GET /event-editions/:id/signals` --- organizer history,
    past-edition rating, registration count, aggregate peer count and
    freshness metadata.

## Attendance

-   `POST /event-editions/:id/check-in` --- trusted check-in mechanism;
    exact QR/manual/import design is an open decision.
-   `POST /event-editions/:id/attendance/:userId/verify` ---
    organizer/admin-only verification where policy permits.
-   `GET /event-editions/:id/attendance/me` --- current user's
    verification state.

Never accept `verified: true` from an ordinary student request. Check-in
tokens should be short-lived, scoped to one edition, and resistant to
replay if QR check-in is chosen.

## Reviews

-   `GET /event-editions/:id/reviews` --- published reviews and
    aggregates.
-   `POST /event-editions/:id/reviews` --- eligible verified attendee
    submits one review.
-   `PATCH /reviews/:reviewId` --- edit under documented policy and
    within allowed time/state.
-   `POST /reviews/:reviewId/report` --- report abuse.
-   `POST /reviews/:reviewId/moderate` --- moderator-only action.

## Compare

-   `POST /compare` --- accepts 1--3 edition IDs and returns common
    comparable fields. Alternatively, the frontend can combine detail
    requests; choose one approach and keep it consistent.

## Administration

-   `GET /college-admin/reports` --- college-admin reports scoped to the authenticated admin's assigned college(s).
- `GET /platform-admin/reports` --- platform-wide reports, platform-admin only.
- `GET /admin/reports`
-   `PATCH /admin/organizers/:id/status`
-   `PATCH /admin/events/:id/status`
-   `PATCH /admin/reviews/:id/status`
-   Admin endpoints require role checks, explicit platform-admin versus college-admin scope checks, and audit records. College admins cannot manage another college's records.

## API rules

-   Use schema validation for params, query, and body.
-   Limit page size and request rates.
-   Return `400` for invalid input, `401` unauthenticated, `403`
    unauthorized, `404` missing/unavailable resources, `409`
    conflicts/duplicates, and `429` rate limits.
-   Use a consistent pagination format.
-   Do not leak whether private user accounts exist through auth errors.
-   API paths are proposed; record deviations here before
    implementation.

## Multi-college contract rules

- Every event-edition response includes a stable `hostCollege` summary (ID and display name) when visible to the caller.
- Event list queries may search across all active participating colleges; the API must also support filtering by host college.
- Registration authorization is based on event eligibility, not simply on whether the student and host college match.
- Organizer mutations validate both organizer ownership and college association.
- College-admin endpoints enforce college scope server-side; a request-supplied `collegeId` never grants access.
- Peer-signal responses distinguish total event registrations from same-college peer counts. Do not return individual attendee identities.
- If the API accepts multiple college filters, validate every ID and impose sensible list-size limits.

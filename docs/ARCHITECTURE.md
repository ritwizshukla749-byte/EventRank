# Architecture Specification

## 1. Proposed stack

-   Frontend: React + Vite.
-   Backend: Node.js + Express.
-   Database: MongoDB with Mongoose or an explicitly chosen equivalent.
-   API: versioned REST API under `/api/v1`.
-   Tests: unit tests for domain services and integration tests for
    API/database behavior. Choose the test runner during repository
    setup and document it.
-   Styling/state/routing libraries are implementation choices unless
    approved in `DECISIONS.md`.

## 2. High-level architecture

Browser → React pages/components → API client → Express routes/controllers → authentication and college-scope middleware → validation → domain services → MongoDB repositories/models.

Domain services: - `eventService` - `organizerService` -
`registrationService` - `attendanceVerificationService` -
`reviewService` - `scoring/qualityScore` - `scoring/fitScore` -
`scoring/preEventSignals`

## 3. Suggested repository layout

``` text
eventrank/
├── AGENTS.md
├── README.md
├── docs/
│   ├── PRD.md
│   ├── SRS.md
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── SCORING_SPEC.md
│   ├── API_CONTRACT.md
│   ├── SECURITY_PRIVACY.md
│   ├── UX_SPEC.md
│   ├── TEST_PLAN.md
│   ├── ROADMAP.md
│   ├── DECISIONS.md
│   └── DEVELOPMENT.md
├── client/
│   └── src/
│       ├── app/
│       ├── pages/
│       ├── components/
│       ├── features/
│       ├── api/
│       ├── hooks/
│       └── utils/
└── server/
    ├── src/
    │   ├── config/
    │   ├── middleware/
    │   ├── modules/
    │   │   ├── auth/
    │   │   ├── users/
    │   │   ├── events/
    │   │   ├── organizers/
    │   │   ├── registrations/
    │   │   ├── attendance/
    │   │   ├── reviews/
    │   │   └── scoring/
    │   ├── routes/
    │   ├── utils/
    │   └── app.js
    └── tests/
```

This is a suggested layout, not a reason to create empty folders. Create
modules as they are implemented.

## 4. Backend design

-   Route layer declares HTTP method and path.
-   Controller layer translates HTTP input/output.
-   Validation layer checks shape, range, enums, and ownership
    constraints.
-   Domain service contains business rules.
-   Model/repository layer performs database operations.
-   Scoring modules are pure functions where possible; database lookups
    happen outside the pure formula.
-   Central error middleware normalizes errors.
-   Auth middleware establishes the authenticated identity. Role, ownership, and college-scope middleware enforce access boundaries.
-   A `collegeService` manages approved college records and onboarding state.
-   Every event discovery query must apply publication/eligibility rules, not an accidental single-college filter.

## 5. Frontend design

-   Pages correspond to user journeys: Discover, Event Detail, Compare,
    Profile, Reviews, Organizer, and optional Admin.
-   Feature components should own local presentation; shared components
    include EventCard, ScoreDisplay, ScoreBreakdown, SignalList,
    CompareTable, FilterBar, LoadingState, EmptyState, and ErrorState.
-   API calls belong in a dedicated API layer, not scattered through
    visual components.
-   Never calculate authoritative scores only in the browser.
-   UI should handle loading, empty, error, unavailable, and
    insufficient-evidence states.

## 6. Data flow: quality score

1.  Request event details.
2.  Service loads the event edition and its host college, the same organizer's eligible history, comparable previous editions, and current eligible reviews. Do not blend data from similarly named organizers at other colleges.
3.  Scoring service computes estimate and evidence metadata.
4.  API returns score, status, component values, sample counts, and
    explanation codes.
5.  UI renders score and evidence state.
6.  When an eligible review is accepted, update/recompute the aggregate
    safely.

## 7. Data flow: Fit for You

1.  Request personalized event feed.
2.  API identifies the authenticated student, their college association, and relevant profile preferences. Cross-college events may be recommended, but peer counts remain scoped by privacy policy.
3.  Fit service compares event attributes with profile attributes.
4.  Service returns per-user score and reason codes.
5.  UI explains matches and mismatches.
6.  If profile fields are missing, return a limited-personalization
    status instead of pretending the score is precise.

## 8. Deployment and configuration

-   Use separate client/server environment files locally; never commit
    secrets.
-   Configure CORS to known origins.
-   Use a health endpoint.
-   Production must use HTTPS, secure cookies or a carefully configured
    token strategy, and managed secrets.
-   Seed data must be idempotent and explicitly demo-only.

## 9. Multi-college architecture requirements

- Add a `College` domain module/model with stable ID, canonical name, slug, status, and only the institution metadata needed by the product.
- Treat college association as a first-class relationship, not a free-text label. Events must reference a host college ID; organizers must reference their home college ID; student profiles must reference their associated college ID.
- Apply authorization filters at the service/query layer for college administrators and organizers. Never rely on frontend filtering to enforce tenant boundaries.
- Public event discovery is intentionally cross-college. Administrative management is intentionally college-scoped unless the user has platform-wide privileges.
- Separate platform-admin permissions from college-admin permissions. Avoid a generic `admin` role that implicitly grants every college access.
- Seed multiple fictional colleges to exercise cross-college discovery and isolation tests.
- Do not introduce separate databases per college for the product unless an approved architecture decision requires it; use shared collections with explicit college references and enforced authorization.

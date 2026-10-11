# Product Requirements Document (PRD)

## EventRank --- Multi-College Product

**Status:** Draft for implementation\
**Product type:** Web application\
**Primary users:** Students; authorized event organizers; platform
administrators

## 1. Product vision

Help students across participating colleges decide which events are worth attending by bringing cross-college discovery, quality evidence, personal relevance, comparison, and post-event feedback into one platform.

## 2. Problem statement

Students hear about events through fragmented channels and often lack
comparable, trustworthy information. Promotional materials emphasize
claims but rarely provide enough evidence about execution quality,
suitability, costs, or expected value. Reviews may not exist before an
event occurs, and a generally good event may still be a poor fit for an
individual student.

## 3. Product principles

1.  **Evidence over hype:** separate organizer claims from attendee
    feedback and historical evidence.
2.  **Two scores, two questions:** quality and personal fit are
    different dimensions.
3.  **Useful before the first review:** show transparent pre-event
    signals for new events.
4.  **Explainability:** students should understand the factors
    influencing scores.
5.  **Trust by design:** verification and abuse controls are part of the
    product.
6.  **Multi-college by design:** support events from multiple participating colleges while keeping institution-specific permissions and privacy boundaries clear.
7.  **Privacy by default:** aggregate peer signals; do not reveal
    individual attendance without consent.

## 4. Goals

-   Let students find upcoming events across participating colleges using search, filters, and personalized ordering.
-   Give students a structured event profile with comparable details.
-   Present Event Quality and Fit for You separately, with explanations.
-   Provide useful evidence before an event has reviews.
-   Let students compare up to three events.
-   Collect structured post-event feedback from verified attendees.
-   Make organizer history and event-edition history reusable across
    events.
-   Provide a demonstrable, seeded dataset for development and judging.

## 5. Product boundaries and non-goals

EventRank is designed for multiple participating colleges from the outset. Cross-college discovery, institution-specific authorization, college onboarding, event eligibility, and privacy boundaries are core product requirements rather than future expansion items.

The product does not aim to provide:
- Unrestricted internet-wide event discovery beyond participating/approved colleges.
- Native mobile applications in the initial web product.
- Ticket payment processing, refunds, or financial settlement.
- Chat, direct messaging, or a full social-following network.
- Uncontrolled scraping of external event platforms.
- AI-generated event facts or unverified claims presented as facts.
- Opaque predictive machine learning as a substitute for explainable scoring.
- Full enterprise college ERP functionality.
- Publicly exposing named attendee lists by default.

These boundaries do not reduce the requirement to support multiple participating colleges in the same deployment.

## 6. Users and roles

### Student

-   Creates an account and student profile.
-   Discovers and compares events.
-   Registers interest/attendance through the platform where supported.
-   Views aggregate peer counts.
-   Submits a review after verified attendance.

### Organizer

-   Is associated with a recognized club, society, department, or authorized entity belonging to a specific participating college.
-   Creates or manages event information, subject to
    authorization/moderation rules.
-   Sees event registration totals and aggregate feedback where
    permitted.
-   Cannot approve their own attendance evidence or alter
    reviews/scores.

### College administrator/moderator

- Manages organizer permissions, event approval, reports, and disputed verification within their own college.
- Cannot administer another college without a separate explicit grant.
- All privileged actions are audited.

### Platform administrator

- Manages participating-college onboarding, global policy, and escalated cross-college reports.
- Has platform-wide access only through an explicitly assigned platform role.
- All privileged actions are audited.

## 7. Core user journeys

### Journey A: Find an event

1.  Student opens Discover.
2.  Searches or filters by topic, type, date, cost, and other available
    fields.
3.  Sees event cards with title, host college, date, cost, Event Quality, Fit for You, and selected signals.
4.  Opens an event to inspect details and score explanations.

### Journey B: Evaluate an event with no reviews

1.  Student opens an event with no attendee reviews.
2.  Sees a clearly labelled preliminary quality estimate or "Not enough
    evidence."
3.  Inspects organizer track record, previous-edition ratings (if
    applicable), registration count, and peers going.
4.  Sees what is known, unknown, and self-reported.

### Journey C: Compare events

1.  Student selects up to three events.
2.  Comparison view displays the same attributes in aligned rows.
3.  The UI highlights differences without claiming one universal winner.
4.  Personalized Fit for You can be shown for the current student;
    quality remains a separate score.

### Journey D: Review after attending

1.  Student's attendance is verified by an approved process.
2.  After the event has ended, the review form becomes available.
3.  Student submits structured dimensions and optional text.
4.  Backend validates eligibility and prevents duplicate reviews.
5.  Scores are recalculated or refreshed and the score breakdown
    updates.

### Journey E: Organizer track record

1.  Student opens organizer profile.
2.  Sees completed events, editions, eligible ratings, and review
    counts.
3.  Evidence is clearly distinguished from organizer-provided claims.

## 8. Functional requirements

### Discovery

-   Search and filter events.
-   Filter by date range, event category/type, cost range, and relevant
    tags.
-   Support sorting by date, Fit for You (when profile data is
    available), and Event Quality.
-   Paginate results.
-   Display clear empty, loading, and error states.

### Event details

-   Show title, description, event type, tags, host college, schedule, location/venue, cost, registration deadline, organizer, capacity where disclosed,
    eligibility, prerequisites, expected outcomes, and
    source/verification status.
-   Display Event Quality and Fit for You separately.
-   Display score explanations and confidence/evidence level.
-   Show organizer history, past-edition ratings, registration count,
    and aggregate peers going when available.
-   Distinguish unknown values from zero values.

### Personalization

-   Profile includes verified/selected college, academic year, branch/department, interests, skills/experience level, event-type preferences, and optional budget.
-   Fit score is calculated server-side and may change by user.
-   If profile data is incomplete, explain that personalization is
    limited and prompt the student to complete relevant fields.
-   Do not treat protected or sensitive characteristics as ranking
    inputs.

### Compare

-   Compare up to three events.
-   Compare common attributes in consistent rows.
-   Handle missing data explicitly.
-   Preserve separate Event Quality and Fit for You columns.

### Registration and peer signals

-   Provide an in-platform registration/"I'm going" action where the
    event supports it.
-   Prevent duplicate active registrations.
-   Registration counts must be computed from valid records, not client
    input.
-   "Peers going" is an aggregate count based on consent and privacy
    thresholds. Do not expose names by default.
-   Clearly label the count's scope (for example, same department) and
    freshness.

### Reviews and verification

-   Reviews are available only after the event end time and after
    attendance verification.
-   Use structured dimensions: organization, content/value, networking,
    and value for time/cost. Each dimension uses a defined numeric
    scale.
-   Optional written feedback must follow length and moderation rules.
-   One review per eligible student per event edition.
-   Reviewers cannot set their own verification status.
-   Organizer and reviewer conflicts must be handled transparently.
-   Allow reporting of abusive or fraudulent reviews.
-   Review edits/deletion policy must be documented; retain audit
    metadata where legally and operationally appropriate.

### Organizer and moderation

-   Organizers have explicit permissions and cannot self-authorize.
-   Event changes that affect date, venue, cost, or eligibility should
    be auditable.
-   Admin can approve/suspend organizers and moderate reported
    events/reviews.
-   A new organizer or event with no history must not be assigned an
    inflated score just because evidence is absent.

## 9. Quality requirements

-   Responsive layout for desktop and mobile web.
-   Accessible forms, semantic structure, keyboard operation, visible
    focus, and sufficient contrast.
-   Consistent API error format.
-   Secure password handling and protected routes.
-   Scoring functions are deterministic and unit-tested.
-   Avoid unnecessary disclosure of personal data.
-   Important state changes are auditable.
-   Demo data is reproducible from a seed script.

## 10. Success metrics for an Product acceptance

-   A student can discover, inspect, and compare events end-to-end.
-   Both scores are displayed and explained independently.
-   At least one event with zero reviews still has useful pre-event
    signals.
-   A verified attendee can submit a review; an unverified user cannot
    submit a verified review.
-   Score updates after eligible reviews are accepted.
-   Invalid or missing data is shown honestly rather than invented.
-   Core flows pass automated tests and a manual acceptance checklist.

## 11. Delivery priorities

### P0 — Foundational product capabilities

Multi-college identity and onboarding; authentication and scoped authorization; event discovery across participating colleges; event details and eligibility; organizer identity/history; both score displays; pre-event signals; compare up to three events; registration; attendance verification; structured verified reviews; scoring tests; representative multi-college seed data; validation and privacy safeguards.

### P1 — Complete operational capabilities

Organizer self-service, college-admin moderation, review/event reporting, richer filters, saved events, score-confidence visualization, audit tooling, and operational dashboards.

### P2 — Extension candidates

External calendar synchronization, notifications, recommendations informed by user behavior, deeper institutional integrations, and native mobile applications.

Delivery phases control implementation order; they do not change the product's multi-college scope. Any feature moved out of a release must be documented explicitly with its impact.

## 12. Assumptions and open product decisions

See `DECISIONS.md`. Do not treat draft assumptions as approved decisions
without recording approval.

## 13. Multi-college requirements

- The platform must support multiple participating colleges in the same deployment.
- Every student profile is associated with a college. The initial onboarding/verification method for that association is an open decision.
- Every organizer belongs to one college unless an explicitly approved cross-college organizer model is introduced.
- Every event edition identifies its host college, even when the event is open to students from other colleges.
- Discovery can show events across participating colleges and filter by host college, location, event type, date, cost, and tags.
- Event eligibility must state whether an event is open to the host college only, selected colleges, or all participating colleges.
- College administrators may manage only their own college's organizers and events. Platform administrators have explicitly separate global permissions.
- Organizer history must be scoped to the correct organizer identity and college. Do not merge similarly named clubs or events across colleges automatically.
- Peer attendance is aggregated within the student's own college by default. Cross-college peer counts require a deliberate privacy/product decision.
- Registration counts may include all eligible registrants for that event edition; UI must distinguish total registrations from same-college peers going.
- Seed data must include several fictional colleges and events, clearly labelled as demo data.

# EventRank

**Discover events worth attending. Know why they're worth it.**

EventRank is a multi-college event discovery and decision-support
platform that helps students discover, evaluate, compare, and review
college events using community feedback, personalized relevance, and
transparent evidence.

Instead of relying on promotional posters or scattered messages,
students can inspect event details, understand an organizer's track
record, compare alternatives, and decide whether an opportunity is worth
their time, money, and effort.

> **Project status:** Planning / early development. Features described
> as planned are not considered implemented until available and tested.

------------------------------------------------------------------------

## The Problem

Students discover events through WhatsApp groups, social media, college
websites, posters, and word of mouth. Information is fragmented,
promotional claims are difficult to evaluate, and reviews often do not
exist until an event is over.

Students need answers to two different questions:

1.  **Is this event likely to be good?**
2.  **Is this event a good fit for me?**

A popular event is not necessarily high-quality, and a high-quality
event is not necessarily relevant to every student.

## The Solution

EventRank brings events from multiple participating colleges into one
platform. Students can discover events across institutions, evaluate
evidence, compare up to three options, register where eligible, and
contribute structured reviews after verified attendance.

**Multi-college discovery is part of the product's core scope, not a
future expansion.**

## Core Differentiators

### Event Quality --- community-driven

Estimates event quality using eligible attendee reviews and available
historical evidence. The score includes an evidence state, review count,
and explanation rather than presenting a number without context.

### Fit for You --- personalized

Estimates how well an event matches an individual student's interests,
skills, academic stage, preferences, and budget. It is calculated for a
student-event pair and is not a universal rating.

### Pre-event evidence

For events with few or no reviews, EventRank can surface: - Organizer
track record. - Ratings and review counts from previous editions, when
available. - Current registration count. - Aggregate peer attendance,
subject to privacy rules.

Registration volume and peer attendance indicate interest; they are
**not proof of event quality**.

### Cross-college discovery with scoped trust

Students can discover eligible events hosted by other participating
colleges. Organizers and college administrators remain scoped to
authorized institutions, while platform-wide administration requires
explicit privileges and audit trails.

## Key Features

The following describes intended product scope. See
[`docs/ROADMAP.md`](docs/ROADMAP.md) for implementation phases and
acceptance criteria.

  ---------------------------------------------------------------------
  Area                               Intended capabilities
  ---------------------------------- ----------------------------------
  Discover                           Search and filter events across
                                     participating colleges

  Event details                      Host college, schedule, venue,
                                     cost, eligibility, prerequisites,
                                     outcomes

  Event Quality                      Community-driven estimate, review
                                     count, historical context,
                                     explanation

  Fit for You                        Profile-based relevance score and
                                     reason codes

  Pre-event signals                  Organizer history, past-edition
                                     ratings, registrations, aggregate
                                     peers going

  Compare                            Compare up to three events using
                                     consistent attributes

  Student profile                    College, department/branch,
                                     academic year, interests, skills,
                                     preferences, optional budget

  Registration                       Register/cancel subject to event
                                     eligibility and registration
                                     policy

  Reviews                            Structured post-event feedback
                                     from verified attendees

  Organizer tools                    Manage events for authorized
                                     college(s)

  College administration             College-scoped onboarding,
                                     event/organizer moderation, and
                                     reporting

  Platform administration            Manage participating colleges and
                                     platform-wide policies

  Trust and privacy                  Scoped permissions, attendance
                                     verification, aggregate peer
                                     signals, audit trails
  ---------------------------------------------------------------------

## How the Scores Work

### Event Quality

The intended approach combines eligible review evidence with historical
evidence where available. As reliable reviews accumulate, they should
contribute more to the estimate than a weak prior.

A possible Bayesian-smoothed model is:

\[ Q = `\frac{kP + n_{\mathrm{eff}}R}{k+n_{\mathrm{eff}}}`{=tex} \]

Where `Q` is the resulting quality estimate, `P` is a historical prior,
`R` is the eligible review aggregate, `k` is prior strength, and `n_eff`
is effective review evidence.

The exact prior construction, weights, confidence thresholds, and
normalization rules must be approved and documented in
[`docs/SCORING_SPEC.md`](docs/SCORING_SPEC.md) before implementation. If
evidence is insufficient, the product must say so instead of inventing a
score.

Historical evidence must be linked by stable event and organizer IDs.
Similarly named organizers from different colleges must not have their
ratings blended automatically.

### Fit for You

The product is intended to use an explainable, deterministic scoring
model initially. Candidate inputs include interest/tag match, skill and
experience-level match, academic year and eligibility, preferred event
types, budget compatibility, and a bounded, privacy-safe peer signal.

The final component weights and hard-constraint behavior remain open
decisions until approved. Fit for You must remain separate from Event
Quality. Events hosted by other colleges can be recommended only when
the student's eligibility allows attendance.

## College Scope and Roles

EventRank supports multiple participating colleges in one deployment.

-   **Student:** belongs to a verified/approved college association,
    discovers eligible events across colleges, manages a profile,
    registers, and reviews events after verified attendance.
-   **Organizer:** manages events for the college and organizer entity
    they are authorized to represent.
-   **College administrator/moderator:** manages authorized organizers,
    events, and reports within assigned college boundaries.
-   **Platform administrator:** manages college onboarding and
    explicitly authorized platform-wide tasks.

Cross-college discovery does not grant access to another college's
private registrations, administrative records, or attendee identities.
The college affiliation verification process and exact role capabilities
are tracked in [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Technology Stack

  ---------------------------------------------------------------------
  Layer                              Proposed technology
  ---------------------------------- ----------------------------------
  Frontend                           React + Vite

  Backend                            Node.js + Express

  Database                           MongoDB

  Data modeling                      Mongoose or another explicitly
                                     selected MongoDB data layer

  API style                          Versioned REST API (`/api/v1`)

  Testing                            Unit, integration, and
                                     UI/acceptance tests; exact tools
                                     to be selected
  ---------------------------------------------------------------------

## Architecture

``` text
Students / Organizers / College Admins / Platform Admin
                           |
                           v
                    React + Vite Client
                           |
                         REST API
                           |
                           v
                    Node.js + Express
                           |
        +------------------+--------------------+
        |                  |                    |
     Identity          Events & Colleges    Registrations
        |                  |                    |
        +------------------+--------------------+
                           |
                     Domain Services
                           |
          +----------------+----------------+
          |                |                |
     Event Quality      Fit for You     Pre-event Signals
          |                |                |
          +----------------+----------------+
                           |
                        MongoDB
```

Scoring logic should live in isolated, testable backend services.
College-scoped access must be enforced on the server, not only in the
frontend. Public event discovery can cross college boundaries;
administrative access cannot unless explicitly authorized.

## Project Structure

Suggested structure; create modules as they are implemented rather than
filling the repository with empty folders.

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
└── server/
    ├── src/
    └── tests/
```

## Documentation for Developers and Agents

Read the root `AGENTS.md` before making changes. The `docs/` directory
is the detailed specification.

  --------------------------------------------------------------------------------
  Document                                            Purpose
  --------------------------------------------------- ----------------------------
  [`PRD.md`](docs/PRD.md)                             Product goals, scope, users,
                                                      requirements, priorities

  [`SRS.md`](docs/SRS.md)                             Functional and
                                                      non-functional requirements

  [`ARCHITECTURE.md`](docs/ARCHITECTURE.md)           System boundaries, modules,
                                                      data flow

  [`DATA_MODEL.md`](docs/DATA_MODEL.md)               Entities, relationships,
                                                      indexes, validation

  [`SCORING_SPEC.md`](docs/SCORING_SPEC.md)           Score semantics, formulas,
                                                      evidence, tests

  [`API_CONTRACT.md`](docs/API_CONTRACT.md)           REST endpoints and response
                                                      conventions

  [`SECURITY_PRIVACY.md`](docs/SECURITY_PRIVACY.md)   Auth, college isolation,
                                                      privacy, abuse prevention

  [`UX_SPEC.md`](docs/UX_SPEC.md)                     Screens, interaction
                                                      behavior, accessibility

  [`TEST_PLAN.md`](docs/TEST_PLAN.md)                 Test layers and acceptance
                                                      scenarios

  [`ROADMAP.md`](docs/ROADMAP.md)                     Implementation phases and
                                                      completion criteria

  [`DECISIONS.md`](docs/DECISIONS.md)                 Confirmed decisions,
                                                      assumptions, open questions

  [`DEVELOPMENT.md`](docs/DEVELOPMENT.md)             Local setup and engineering
                                                      conventions
  --------------------------------------------------------------------------------

### Instructions for AI coding agents

1.  Read `AGENTS.md` and the relevant product/technical specifications
    before coding.
2.  Inspect existing code before editing.
3.  Do not silently decide unresolved product or security questions.
4.  Implement one small, testable slice at a time.
5.  Run available tests, lint, and build checks.
6.  Report changed files, checks run, acceptance criteria met, and known
    gaps.
7.  Update documentation when approved behavior or contracts change.
8.  Do not simplify the product to single-college scope for convenience.

## Getting Started

This project is under active development. Commands below are templates;
verify them against actual package scripts once the client and server
are scaffolded.

### Prerequisites

-   A supported Node.js LTS release and npm.
-   MongoDB local instance or a managed MongoDB database.
-   Git.

### 1. Clone the repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd eventrank
```

Replace `<YOUR_REPOSITORY_URL>` with the actual repository URL.

### 2. Configure environment variables

Create a server `.env` file using the variable names selected by the
implementation. Example placeholders:

``` dotenv
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/eventrank
CLIENT_ORIGIN=http://localhost:5173
```

If the Vite app uses a configurable API base URL, create a client `.env`
file:

``` dotenv
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Authentication-related variables depend on the approved session/token
design. Use `.env.example` as the authoritative list once it exists.
Never commit real secrets.

### 3. Install and run

Once workspace scripts are implemented, use the commands documented in
`docs/DEVELOPMENT.md` and the relevant `package.json` files. Do not
assume a root-level `npm run dev` exists until it is configured.

### 4. Seed development data

Seed multiple fictional colleges with distinct students, organizers,
event editions, and eligibility policies. Include events open across
participating colleges and events restricted to their host college. Seed
scripts must be repeatable and must not create duplicates on every run.

## Development Workflow

1.  **Phase 0 --- Decisions and repository setup:** settle blocking
    decisions and establish the workspace.
2.  **Phase 1 --- Foundation and college-aware core models:** college
    directory, identity, roles, associations, models, validation, and
    seed data.
3.  **Phase 2 --- Cross-college events and organizer APIs:** discovery,
    details, filters, organizer history, registration, and eligibility.
4.  **Phase 3 --- Scoring engine:** Event Quality, Fit for You,
    pre-event signals, explanations.
5.  **Phase 4 --- Attendance and reviews:** verification, review
    eligibility, structured reviews, score refresh.
6.  **Phase 5 --- Frontend journeys:** discovery across colleges, event
    details, comparison, profile, registration, reviews, and scoped
    administration.
7.  **Phase 6 --- Hardening and operational readiness:**
    security/isolation review, testing, reproducible demo data,
    documentation.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for deliverables and acceptance
criteria. Phasing is an implementation sequence, not a reduction of the
multi-college product scope.

## Testing and Quality

Tests should cover: - Cross-college event discovery and host-college
filters. - College-admin and organizer isolation. - Event eligibility
for registrations across colleges. - Quality score calculations,
evidence states, and score bounds. - Fit score calculations and
incomplete profiles. - Exclusion of ineligible reviews from official
scores. - Registration and review duplicate prevention. - Prevention of
client-forged attendance verification. - Peer-count privacy
thresholds. - Comparison limits and UI loading/empty/error states. -
Seed-script repeatability across multiple colleges.

## Security and Privacy Principles

-   Enforce authorization and college scope on the server for every
    protected operation.
-   Never trust client-submitted scores, roles, registration counts, or
    attendance verification.
-   Do not expose named attendee lists by default; use privacy-safe
    aggregate counts.
-   Show review counts and evidence status alongside quality estimates.
-   Validate all input and rate-limit sensitive endpoints.
-   Keep secrets and private attendance evidence out of source control
    and logs.
-   Distinguish missing data from zero, not applicable, and insufficient
    evidence.
-   Cross-college discovery must not reveal another college's private
    administrative data or attendee identities.

See [`docs/SECURITY_PRIVACY.md`](docs/SECURITY_PRIVACY.md) for full
requirements.

## Roadmap

The product is multi-college from the outset. Potential extension
candidates include calendar synchronization, notifications,
behavior-informed personalization, deeper institutional integrations,
and native mobile applications. Any extension must preserve trust,
explainability, and the core event decision workflow.

## Contributing

Contributions should align with the PRD and documented decisions.

Before submitting a change: - Link the change to a requirement or
approved decision. - Include or update tests. - Run available lint,
test, and build commands. - Update API/data/scoring documentation when
contracts change. - Document known limitations. - Never include secrets
or real student data in fixtures.

Review AI-generated changes and test results rather than accepting
generated output without verification.

## License

No license has been selected yet. Until a license is added to the
repository, do not assume that the project is open source or that others
have permission to redistribute it.

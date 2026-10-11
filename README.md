# EventRank — Agent Documentation Pack

## Purpose
This directory is the source of truth for planning, implementing, testing, and reviewing EventRank. Read the relevant documents before changing code.

## Product summary
EventRank is a **multi-college event discovery and decision-support platform**. Students can discover events across participating colleges, evaluate evidence, compare options, and review events after verified attendance.

Every event has two separate score concepts:
- **Event Quality (0–100):** a community/historical estimate of event execution quality.
- **Fit for You (0–100):** a personalized estimate of relevance to a specific student.

Before reviews exist, EventRank surfaces available pre-event evidence: organizer history, previous-edition ratings, registration counts, and privacy-safe peer attendance signals.

## Document index
1. `AGENTS.md` — instructions for coding agents and workflow rules.
2. `PRD.md` — product requirements and scope.
3. `SRS.md` — functional and non-functional requirements.
4. `ARCHITECTURE.md` — system boundaries, modules, and data flow.
5. `DATA_MODEL.md` — entities, relationships, indexes, and validation.
6. `SCORING_SPEC.md` — score semantics, formulas, safeguards, and examples.
7. `API_CONTRACT.md` — proposed REST API contract.
8. `SECURITY_PRIVACY.md` — authentication, authorization, privacy, and abuse controls.
9. `UX_SPEC.md` — key screens, states, and interaction rules.
10. `TEST_PLAN.md` — testing strategy and acceptance scenarios.
11. `ROADMAP.md` — implementation phases and definition of done.
12. `DECISIONS.md` — confirmed decisions, assumptions, and unresolved questions.
13. `DEVELOPMENT.md` — local setup and engineering conventions.
14. Root `README.md` — public-facing project overview and setup entry point.

## Authority and conflict resolution
- Confirmed decisions in `DECISIONS.md` and requirements in `PRD.md` take precedence over implementation guesses.
- `SCORING_SPEC.md` is authoritative for scoring behavior.
- `API_CONTRACT.md` is authoritative for API shapes.
- If documents conflict or an essential decision is unresolved, do not silently guess. Record the conflict and ask for clarification or propose a decision in `DECISIONS.md`.
- Update docs when implementation changes a contract. Do not let code and docs drift.

## Multi-college product rules
- Multi-college discovery is a core requirement, not a future expansion.
- `College` is a first-class entity with stable IDs and an approval/status lifecycle.
- Students, organizers, and event editions are associated with colleges where applicable.
- Students may discover events across participating colleges; registration is controlled by each event's eligibility policy.
- College administrators are scoped to assigned colleges. Platform administrators have separate, explicit global permissions.
- Peer attendance is shown as a privacy-safe aggregate scoped to the student's own college by default.
- Demo seeds must contain multiple fictional colleges and tests for cross-college discovery and tenant isolation.
- The project may be implemented in phases, but phasing must not silently downgrade the product to single-college scope.

# UX and Interface Specification

## Product feel

Clear, credible, practical, and student-focused. Avoid a generic event
poster wall. Prioritize evidence and decision-making over decoration.

## Global navigation

-   Discover (events across participating colleges)
-   Compare (show selected count)
-   My profile
-   My registrations / events
-   Organizer tools when authorized
-   Admin tools only for administrators

## 1. Discover page

Must include: - Search input. - Filters for date, event type/category,
cost, and tags. - Sort by upcoming, Event Quality (where evidence
exists), and Fit for You for a personalized feed. - Event cards with title, host college, organizer, date/time, cost, tags, Event Quality status/score, Fit for You score, and selected pre-event signals. - Compare
selection, maximum three. - Clear loading, no-results, error, and
profile-incomplete states.

Do not use a high numerical quality score when evidence is insufficient.
Use an explicit label such as "Not enough evidence."

## 2. Event details page

Information hierarchy: 1. Title, organizer, date, venue, cost,
registration state/action. 2. Two separate score panels. 3. "Why this
score?" breakdown. 4. Pre-event signals. 5. Eligibility, prerequisites,
outcomes, agenda/speakers if available. 6. Reviews and previous-edition
context. 7. Report event action.

Clearly label organizer-provided claims vs verified or community-derived
evidence.

## 3. Score display

-   Always label which score is shown.
-   Show score out of 100 only when available under the scoring policy.
-   Include review count and evidence state.
-   Provide textual explanations for accessibility; do not rely on color
    alone.
-   Do not imply Fit for You is a guarantee or Event Quality is
    objective truth.

## 4. Compare page

-   Accept at most three events.
-   Show the same rows in the same order for every event.
-   Rows include host college, date, cost, type, organizer, Event Quality, Fit for You, review count/evidence status, registration count, eligibility, and relevant outcomes.
-   Show "Not provided" or "Not applicable" distinctly.
-   Avoid a universal "winner" badge; if highlighting an event, explain
    the criterion.

## 5. Profile page

-   Editable interests, skills/experience level, branch/department,
    academic year, preferred event types, optional budget, and privacy
    preference for peer aggregates.
-   Explain that more profile information improves personalization.
-   Do not require optional budget or social participation to use the
    platform.

## 6. Review form

-   Available only after completion and verified attendance.
-   Four rating dimensions: organization, content/value, networking,
    time/cost value.
-   Optional text with clear length limit and community guidelines.
-   Show submission confirmation and review moderation state.
-   Prevent duplicate review submission and explain why the form is
    unavailable when ineligible.

## 7. Organizer views

If included in the initial release: - Create/edit event drafts. - See registration
aggregate. - Manage authorized events. - Never offer organizer control
over official scores or review deletion.

## 8. Accessibility and responsive behavior

-   Semantic headings and controls.
-   Every input has a label.
-   Keyboard-accessible filters, dialogs, and compare controls.
-   Visible focus state and sufficient contrast.
-   Mobile layouts must not require horizontal scrolling for core
    actions; comparison may use stacked cards on narrow screens.

## 9. Multi-college discovery and trust

- Include a host-college label on event cards, details, and comparison views; do not rely on color alone to communicate institution.
- Provide a college filter while allowing cross-college discovery by default for eligible published events.
- Make event eligibility visible (host college only, selected colleges, or all participating colleges) before registration.
- College profile pages may summarize approved organizers and public event history for that institution.
- Peer signals should be labelled with their scope, such as “18 peers from your college going.” Do not imply that total registrations are same-college peers.
- If a college or event is pending approval, suspended, or otherwise unavailable, show it only to authorized roles with a clear status.

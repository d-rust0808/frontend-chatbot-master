## Context links
- Parent plan: `plan.md`
- Screens from `phase-02-screens.md`

## Overview
- Date: 2026-01-06
- Description: Define UX guardrails, states, and a11y checklist for admin & tenant apps.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights
- Existing components use shadcn + Tailwind with rounded iOS styling.
- Need consistent loading/empty/error patterns and keyboard-friendly navigation.

## Requirements
- Standardize status chips/badges, tables, forms, modals, toasts.
- Define loading skeletons and empty states with calls-to-action.
- a11y: focus management, aria labels, semantic elements, color contrast.

## Architecture
- Reuse design tokens and primitives; avoid inline styles.
- Centralize shared UI patterns under `components/ui` or feature-level components.

## Related code files
- `components/ui/*`
- `components/layout/admin-shell.tsx`, `components/layout/app-shell.tsx`
- `app/globals.css`, `tailwind.config.ts`

## Implementation Steps
- [ ] Create UX pattern checklist (forms, tables, badges, modals).
- [ ] Define skeleton and empty-state components/templates.
- [ ] Document a11y do/don't for new features.

## Todo list
- [ ] Prepare reusable skeletons and empty-state copy.
- [ ] Set badge/color rules per status.

## Success Criteria
- Documented UX patterns applied across modules.
- a11y checklist adopted; no keyboard traps; sufficient contrast.

## Risk Assessment
- Inconsistent patterns between admin and tenant → mitigation: shared templates.
- Accessibility regressions → mitigation: checklist in PR review.

## Security Considerations
- Mask sensitive values; confirm destructive actions.
- Avoid exposing tokens/keys in UI or logs.

## Next steps
- Implement according to phases once approved.


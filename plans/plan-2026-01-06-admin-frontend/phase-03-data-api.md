## Context links
- Parent plan: `plan.md`
- Screens from `phase-02-screens.md`
- APIs: `lib/api/admin.ts`, `lib/api/platforms.ts`, `lib/api/chatbots.ts`, `lib/api/conversations.ts`

## Overview
- Date: 2026-01-06
- Description: Map data needs per screen to existing API client calls; note gaps.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights
- Existing admin APIs: stats, users, tenants.
- Tenant APIs: chatbots, platforms, conversations.
- Gaps likely: billing/plans, orders/customers/products/categories, logs, DB config, function-call registry.

## Requirements
- For each screen, list API endpoints used or needed.
- Define query keys and cache invalidation strategy.
- Note pagination/filter/search parameters.

## Architecture
- Use TanStack Query with keys `['resource', params]`.
- Centralize new endpoints under `lib/api/*` with typed responses.

## Related code files
- `lib/api/admin.ts`
- `lib/api/platforms.ts`
- `lib/api/chatbots.ts`
- `lib/api/conversations.ts`
- `lib/api/types.ts`

## Implementation Steps
- [ ] Create data mapping table (screen → endpoint → queryKey → fields).
- [ ] Identify missing endpoints; propose shapes.
- [ ] Define mutations + optimistic updates where relevant.

## Todo list
- [ ] Draft query/mutation plan for each module.
- [ ] Capture headers/tenant requirements (x-tenant-slug).

## Success Criteria
- Every screen has a defined data source or documented API gap.
- Query keys and params standardized; no `any`.

## Risk Assessment
- Missing backend support → mitigation: document gaps early.
- Overfetching → mitigation: limit/filters; pagination defaults.

## Security Considerations
- Ensure tenant scoping header applied consistently.
- Avoid leaking secrets in payloads/logs; mask credentials in UI.

## Next steps
- UX consistency/a11y checklist (Phase 04).


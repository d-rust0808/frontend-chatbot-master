## Context links
- Parent plan: `plan.md`
- Depends on IA from `phase-01-discovery.md`

## Overview
- Date: 2026-01-06
- Description: Define screen list, core states (loading/empty/error), and component needs.
- Priority: P2
- Implementation status: pending
- Review status: pending

## Key Insights
- Need consistent cards/lists/forms using shadcn components with rounded iOS styling.
- Super-admin screens: Admins, Tenants, Logs/Config.
- Tenant screens: Platforms/Connections, Plans/Billing, Orders, Customers, Products/Categories, DB config, Chatbot function-calls, Message history.

## Requirements
- For each screen: purpose, primary actions, key metrics, table columns/filters.
- Define empty/loading/error states per screen.
- Identify shared components (tables, filters, badges, status chips).

## Architecture
- Feature folders under `/app/[tenantSlug]/...` and `/admin/...`.
- Reuse shells; avoid >200 line components; split forms into subcomponents.

## Related code files
- `components/ui/*`, `components/layout/*`
- Feature entrypoints in `app/app/[tenantSlug]/*` and `app/admin/*`

## Implementation Steps
- [ ] List screens per persona with actions.
- [ ] Draft data shapes for lists/cards.
- [ ] Define components to build (table, filters, stats cards, log viewer).
- [ ] Specify states (loading/empty/error) with copy.

## Todo list
- [ ] Write screen spec table (route, purpose, actions).
- [ ] Capture component reuse opportunities.

## Screen specs (per persona)
- Super-admin (admin shell `/admin`)
  - Dashboard: KPIs (tenants, active users, errors), alerts, quick links; actions: view reports, drill-down to tenants/logs.
  - Users: table (name, email, role, status, last active), filters (role/status), actions: invite, edit role, disable.
  - Tenants: table (name, plan, status, usage), filters (status/plan), actions: create, suspend, view analytics.
  - Analytics: charts for tenant growth/errors/usage, time filters; actions: export CSV, change interval.
  - Logs (planned): searchable log viewer, filters (level, tenant, service, date); actions: view detail, export.
  - Config (planned): feature flags, rate limits, integrations; actions: edit/save with confirmation.
  - Billing (planned): plans, invoices; actions: adjust plan, issue credit.
  - Settings: profile/security; actions: change password, 2FA toggle.

- Tenant admin (tenant shell `/app/[tenantSlug]`)
  - Dashboard: KPIs (chatbot sessions, CSAT if available, active platforms), recent activity; actions: create chatbot, connect platform.
  - Chatbots: table/cards (name, model, status, last updated), filters (status/model), actions: create, edit, duplicate, archive.
  - Chatbot detail `[chatbotId]`: overview, settings, intents/functions (future), publish status; actions: save, publish/unpublish.
  - Chatbot new: form with model, temperature, knowledge sources; actions: create draft.
  - Conversations: list with search/filter (status/channel/date), actions: view thread, export.
  - Conversation detail `[conversationId]`: transcript, tags, sentiment (future), actions: add note, export, reassign.
  - Platforms: list of integrations with status; actions: connect, disconnect, view health.
  - Platform connect: connection wizard; actions: auth, test connection, save.
  - DB config (planned): connection fields, test button; actions: save, test.
  - Messages history (planned): export/download; actions: filter, export.
  - Products (planned): table (name, price, stock), actions: create, edit, archive.
  - Categories (planned): table (name, items count), actions: create, edit, reorder.
  - Customers (planned): table (name, email, status, LTV), actions: import, edit, disable.
  - Orders (planned): table (id, total, status, date), filters (status/date), actions: view, refund.
  - Plans/Billing (planned): plan summary, usage/balance, invoices; actions: upgrade/downgrade, pay invoice.
  - Analytics: charts (sessions, conversions, platform uptime), filters; actions: export.
  - Settings: profile, API keys (masked), webhooks; actions: rotate key, test webhook.

## Data shapes (MVP drafts)
- List rows/cards use typed models; avoid `any`.
- Common columns:
  - User: id, name, email, role, status, lastActive.
  - Tenant: id, name, slug, plan, status, usage.
  - Chatbot: id, name, model, status, updatedAt.
  - Conversation: id, subject, channel, status, createdAt, updatedAt.
  - Platform: id, name, type, status, connectedAt.
  - Order: id, total, status, createdAt, customerName.
- Filters: status enum, date ranges, search string; reuse filter component.

## Components to build/reuse
- DataTable (sortable, paginated, selectable) with filter toolbar.
- Stats cards (KPI, trend delta).
- Status badge/chip (enum → color).
- Log viewer (for admin logs) with search + level/tenant filter.
- Empty/Error/Loading state components with icon + action.
- Forms: split into sections, use RHF + Zod.

## States (copy patterns)
- Loading: skeletons for table/cards, “Loading data…”.
- Empty: concise message + primary CTA; example “No chatbots yet. Create your first chatbot.”
- Error: “Unable to load data. Retry or contact support.” + Retry button.
- Restricted (role/scope): “You don’t have access to this action.”

## Component reuse opportunities
- Tables: single generic DataTable with column config per feature.
- Filters: shared toolbar with search + select + date range slots.
- Badges: status → color map reused across admin/tenant.
- Layout: continue `AdminShell` / `AppShell`; keep per-feature pages <200 lines, extract subcomponents.

## Decisions & rationale
- Favor shared primitives (table, filters, badges, skeletons) to keep DRY and consistent UX.
- Keep placeholders for planned modules to de-risk nav churn; concrete UI to be done in Phase 03/04 when data/API ready.
- Avoid over-spec: list core columns/actions only; refine when API contracts defined.

## Success Criteria
- Screen specs cover all requested modules with clear actions and states.
- Component needs identified to minimize duplication.

## Risk Assessment
- Scope creep across many modules → mitigation: prioritize MVP subset.
- Inconsistent UX across modules → mitigation: shared patterns checklist.

## Security Considerations
- Role-based visibility of actions (admin vs tenant).
- Sensitive fields (keys/credentials) masked and not logged.

## Next steps
- Map screens to data/API needs (Phase 03).


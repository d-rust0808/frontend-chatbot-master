## Context links
- Parent plan: `plan.md`
- Layouts: `components/layout/admin-shell.tsx`, `components/layout/app-shell.tsx`
- APIs: `lib/api/admin.ts`, `lib/api/chatbots.ts`, `lib/api/platforms.ts`

## Overview
- Date: 2026-01-06
- Description: Understand roles (super-admin vs tenant admin), map IA and core flows.
- Priority: P2
- Implementation status: done
- Review status: pending

## Key Insights
- Two shells exist (admin vs tenant). Need IA that cleanly separates admin oversight from tenant operations.
- API surface already has admin stats/users/tenants and tenant chatbots/platforms.

## Requirements
- List personas: super-admin (manage admins/tenants/logs/config), tenant admin (business ops, integrations).
- Draft navigation groups for each persona with hierarchy.
- Identify critical screens and empty/error/loading states needs.

## Architecture
- Navigation model per shell; feature-based folders per module.
- Shared UI primitives via `components/ui`, shells wrap feature routes.

## Related code files
- `components/layout/admin-shell.tsx`
- `components/layout/app-shell.tsx`
- `lib/api/admin.ts`, `lib/api/platforms.ts`, `lib/api/chatbots.ts`

## Implementation Steps
- [x] Inventory existing routes per shell.
- [x] Define role-based nav map (admin vs tenant).
- [x] Map features to routes and future sections.

## Todo list
- [x] Collect current routes and intended new ones.
- [x] Draft IA diagram (text/ASCII).

## Findings (2026-01-06)
- Personas:
  - Super-admin: manage admins, tenants, configs, logs/audit, global analytics.
  - Tenant admin: operate chatbots/conversations/platforms, manage products/categories/customers/orders, billing/plan balance, DB config for function-calling, message history.

- Current routes (by shell):
  - Admin shell `/admin`: dashboard, users, tenants, analytics, settings. Missing yet: logs/audit, system config, billing/plan mgmt.
  - Tenant shell `/app/[tenantSlug]`: dashboard, chatbots (list/detail/new), platforms (list/connect), conversations (list/detail), analytics, settings. Missing yet: plans/balance, orders, customers, products, categories, DB config, message history exports.

- Role-based navigation map (proposed)
  - Admin:
    - Overview: dashboard
    - People: users
    - Tenants: tenants
    - Analytics: analytics
    - Operations: audit logs (placeholder), system config (placeholder)
    - Billing: plans/billing (placeholder)
    - Settings: settings
  - Tenant:
    - Overview: dashboard
    - Bots: chatbots (list/detail/new), conversations (list/detail), message history/export (placeholder)
    - Integrations: platforms list/connect, DB config for function-calling (placeholder)
    - Commerce: products, categories, customers, orders (placeholders)
    - Billing: plans/balance (placeholder)
    - Analytics: analytics
    - Settings: settings

- Feature-to-route mapping and planned additions
  - Admin: add `/admin/logs`, `/admin/config`, `/admin/billing` (exact naming TBD with API).
  - Tenant: add `/app/[tenantSlug]/plans`, `/balance`, `/orders`, `/customers`, `/products`, `/categories`, `/db-config`, `/messages` (history/export).

## IA diagram (ASCII, per shell)
Admin shell
```
/admin
  ├─ dashboard
  ├─ users
  ├─ tenants
  ├─ analytics
  ├─ logs (planned)
  ├─ config (planned)
  ├─ billing (planned)
  └─ settings
```

Tenant shell
```
/app/[tenantSlug]
  ├─ dashboard
  ├─ chatbots
  │   ├─ [chatbotId]
  │   └─ new
  ├─ conversations
  │   └─ [conversationId]
  ├─ platforms
  │   └─ connect
  ├─ db-config (planned)
  ├─ messages (planned)
  ├─ products (planned)
  ├─ categories (planned)
  ├─ customers (planned)
  ├─ orders (planned)
  ├─ plans (planned)
  ├─ balance (planned)
  ├─ analytics
  └─ settings
```

## Decisions & rationale
- Keep strict scope separation via `/admin` vs `/app/[tenantSlug]` to avoid data leakage.
- Reserve placeholders for billing/logging/DB-config to de-risk future additions and navigation churn.
- Use existing shells (`AdminShell`, `AppShell`) to host new links when endpoints/UX specs are ready; no component changes until Phase 02.

## Success Criteria
- Clear IA listing screens per persona with ownership and purpose.
- No overlap/confusion between admin and tenant scopes.

## Risk Assessment
- Risk: Overloading shells with mixed scopes → mitigation: strict route prefixes (/admin vs /app/[tenant]).
- Risk: Missing future features (billing/logs) → mitigation: reserve nav placeholders.

## Security Considerations
- Enforce scope separation via route prefixes and auth checks.
- Avoid exposing tenant data in admin shell without proper headers.

## Next steps
- Feed IA into screen specs (Phase 02).


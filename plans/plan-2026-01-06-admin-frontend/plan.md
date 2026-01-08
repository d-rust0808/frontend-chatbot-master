---
title: "Admin & Tenant Frontend IA and Screens"
description: "Design information architecture and screens for super-admin and tenant admins"
status: pending
priority: P2
effort: 6h
branch: main
tags: [frontend, design, ia, admin, tenant]
created: 2026-01-06
---

## Scope
- Super-admin (sp-admin) console: manage admins, tenants, configs, logs.
- Tenant admin app: manage platform connections, plans/balance, orders, customers, products, categories, DB config for function-calling, message history.
- Align IA, navigation, and UI patterns with existing `AdminShell` and `AppShell`.

## Phases
- [x] Phase 01 – Discovery & IA (`phase-01-discovery.md`)
- [ ] Phase 02 – Screen Specs & States (`phase-02-screens.md`)
- [ ] Phase 03 – Data & API mapping (`phase-03-data-api.md`)
- [ ] Phase 04 – UX consistency & a11y checklist (`phase-04-ux-a11y.md`)

## Notes
- Target App Router (Next.js 14), shadcn/ui + Tailwind.
- Respect coding standards: strict typing, feature-based structure, <200 line components.
- Use existing shells: `components/layout/admin-shell.tsx` and `components/layout/app-shell.tsx`.


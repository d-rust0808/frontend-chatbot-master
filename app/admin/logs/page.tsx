'use client';

import { FeaturePlaceholder } from '@/components/feature-placeholder';

const plannedItems = [
  'Searchable audit trail with filters for level, tenant, service, and time range',
  'Event detail view with metadata (actor, tenant, request id)',
  'CSV/JSON export with scoped filters',
  'Pagination with sensible defaults to avoid overfetching',
];

export default function AdminLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Investigate platform activity across tenants and services.
        </p>
      </div>
      <FeaturePlaceholder
        title="Logs module (planned)"
        description="Coming soon once backend endpoints are available."
        plannedItems={plannedItems}
        badge="Planned"
      />
    </div>
  );
}


import { AppShell } from '@/components/layout/app-shell';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

interface TenantPageProps {
  params: { tenantSlug: string };
}

const plannedItems = [
  'Orders table with id, total, status, and date',
  'Filters for status and date range with pagination',
  'Order detail view with line items (future)',
  'Refund/adjustment actions gated by permissions',
];

export default function TenantOrdersPage({ params }: TenantPageProps) {
  const { tenantSlug } = params;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Track and manage customer orders tied to chatbot flows.
          </p>
        </div>
        <FeaturePlaceholder
          title="Orders (planned)"
          description="Placeholder until order APIs and workflows are ready."
          plannedItems={plannedItems}
          badge="Planned"
        />
      </div>
    </AppShell>
  );
}


import { AppShell } from '@/components/layout/app-shell';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

interface TenantPageProps {
  params: { tenantSlug: string };
}

const plannedItems = [
  'Customer table with name, email, status, and LTV',
  'Import flow with progress and error handling',
  'Edit/disable actions with role-based access',
  'Filters for status and last active date',
];

export default function TenantCustomersPage({ params }: TenantPageProps) {
  const { tenantSlug } = params;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer profiles powering orders and personalization.
          </p>
        </div>
        <FeaturePlaceholder
          title="Customers (planned)"
          description="Reserved for customer directory and import tools."
          plannedItems={plannedItems}
          badge="Planned"
        />
      </div>
    </AppShell>
  );
}


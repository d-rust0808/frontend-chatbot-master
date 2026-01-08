import { AppShell } from '@/components/layout/app-shell';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

interface TenantPageProps {
  params: { tenantSlug: string };
}

const plannedItems = [
  'Product catalog with name, price, stock, and status',
  'Create/edit flows with validation and optimistic updates',
  'Archive/unarchive with confirmation to prevent accidental hides',
  'Search and filters (status, category) with pagination',
];

export default function TenantProductsPage({ params }: TenantPageProps) {
  const { tenantSlug } = params;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage product catalog used by chatbots and orders.
          </p>
        </div>
        <FeaturePlaceholder
          title="Products (planned)"
          description="Ready for inventory APIs and pricing rules."
          plannedItems={plannedItems}
          badge="Planned"
        />
      </div>
    </AppShell>
  );
}


import { AppShell } from '@/components/layout/app-shell';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

interface TenantPageProps {
  params: { tenantSlug: string };
}

const plannedItems = [
  'Category list with item counts',
  'Create/edit with slug generation and validation',
  'Reorder support for navigation hierarchy',
  'Delete with safeguards to avoid orphaned products',
];

export default function TenantCategoriesPage({ params }: TenantPageProps) {
  const { tenantSlug } = params;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Organize products for chatbot flows and storefronts.
          </p>
        </div>
        <FeaturePlaceholder
          title="Categories (planned)"
          description="Nav placeholder until category APIs are available."
          plannedItems={plannedItems}
          badge="Planned"
        />
      </div>
    </AppShell>
  );
}


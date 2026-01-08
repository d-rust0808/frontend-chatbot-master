import { AppShell } from '@/components/layout/app-shell';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

interface TenantPageProps {
  params: { tenantSlug: string };
}

const plannedItems = [
  'Connection fields (host, port, db name, user, password with masking)',
  'Test connection action with clear success/error feedback',
  'Scope connections per tenant to prevent data leakage',
  'Status badge to surface last verified time',
];

export default function TenantDbConfigPage({ params }: TenantPageProps) {
  const { tenantSlug } = params;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Database Config</h1>
          <p className="text-muted-foreground">
            Configure database access for function-calling safely.
          </p>
        </div>
        <FeaturePlaceholder
          title="DB configuration (planned)"
          description="Reserved for secure connection management once endpoints land."
          plannedItems={plannedItems}
          badge="Planned"
        />
      </div>
    </AppShell>
  );
}


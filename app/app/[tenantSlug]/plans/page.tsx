import { AppShell } from '@/components/layout/app-shell';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

interface TenantPageProps {
  params: { tenantSlug: string };
}

const plannedItems = [
  'Current plan summary with usage caps and renewal date',
  'Upgrade/downgrade actions with confirmation',
  'Invoice list with download links',
  'Usage charts to show consumption against limits',
];

export default function TenantPlansPage({ params }: TenantPageProps) {
  const { tenantSlug } = params;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Plans</h1>
          <p className="text-muted-foreground">
            Review subscription details and invoices.
          </p>
        </div>
        <FeaturePlaceholder
          title="Plans & billing (planned)"
          description="Navigation placeholder ready for billing endpoints."
          plannedItems={plannedItems}
          badge="Planned"
        />
      </div>
    </AppShell>
  );
}


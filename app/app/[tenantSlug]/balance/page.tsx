import { AppShell } from '@/components/layout/app-shell';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

interface TenantPageProps {
  params: { tenantSlug: string };
}

const plannedItems = [
  'Balance summary with credits/usage',
  'Top-up flow with payment confirmation',
  'Usage breakdown by feature (chatbots, platforms, exports)',
  'Alerts for low balance with recommended actions',
];

export default function TenantBalancePage({ params }: TenantPageProps) {
  const { tenantSlug } = params;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Balance</h1>
          <p className="text-muted-foreground">
            Monitor and fund your tenant balance.
          </p>
        </div>
        <FeaturePlaceholder
          title="Balance (planned)"
          description="Reserved for balance tracking and top-up flows."
          plannedItems={plannedItems}
          badge="Planned"
        />
      </div>
    </AppShell>
  );
}


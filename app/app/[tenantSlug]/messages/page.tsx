import { AppShell } from '@/components/layout/app-shell';
import { FeaturePlaceholder } from '@/components/feature-placeholder';

interface TenantPageProps {
  params: { tenantSlug: string };
}

const plannedItems = [
  'Conversation/message history export with date/channel filters',
  'Search by user, tag, or sentiment (future)',
  'Bulk export with background job status',
  'Role-based visibility to avoid cross-tenant leakage',
];

export default function TenantMessagesPage({ params }: TenantPageProps) {
  const { tenantSlug } = params;

  return (
    <AppShell tenantSlug={tenantSlug}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Message History</h1>
          <p className="text-muted-foreground">
            Review and export historical conversation messages.
          </p>
        </div>
        <FeaturePlaceholder
          title="Message history (planned)"
          description="Placeholder for export and audit tooling."
          plannedItems={plannedItems}
          badge="Planned"
        />
      </div>
    </AppShell>
  );
}


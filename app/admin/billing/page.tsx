import { FeaturePlaceholder } from '@/components/feature-placeholder';

const plannedItems = [
  'Plan catalog with pricing and feature limits',
  'Invoice list with statuses and amounts',
  'Adjustments/credits flow with confirmation',
  'Exportable billing history for compliance',
];

export default function AdminBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Manage plans, invoices, and credits for all tenants.
        </p>
      </div>
      <FeaturePlaceholder
        title="Billing module (planned)"
        description="Navigation and layout placeholders ready for billing APIs."
        plannedItems={plannedItems}
        badge="Planned"
      />
    </div>
  );
}


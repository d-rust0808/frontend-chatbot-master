import { FeaturePlaceholder } from '@/components/feature-placeholder';

const plannedItems = [
  'Feature flag toggles with auditability',
  'Rate limit and quota controls per tenant or plan',
  'Third-party integration keys with masking',
  'Save with confirmation and rollback plan',
];

export default function AdminConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Config</h1>
        <p className="text-muted-foreground">
          Centralized controls for platform-level features and safeguards.
        </p>
      </div>
      <FeaturePlaceholder
        title="Configuration module (planned)"
        description="UI hooks reserved for upcoming configuration APIs."
        plannedItems={plannedItems}
        badge="Planned"
      />
    </div>
  );
}


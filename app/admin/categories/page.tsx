import { FeaturePlaceholder } from '@/components/feature-placeholder';

const plannedItems = [
  'Category management with CRUD operations',
  'Category hierarchy and nesting support',
  'Bulk import/export functionality',
  'Category assignment to products',
];

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">
          Manage product categories across tenants.
        </p>
      </div>
      <FeaturePlaceholder
        title="Categories module (planned)"
        description="Coming soon once backend endpoints are available."
        plannedItems={plannedItems}
        badge="Planned"
      />
    </div>
  );
}


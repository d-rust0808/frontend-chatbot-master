import { FeaturePlaceholder } from '@/components/feature-placeholder';

const plannedItems = [
  'Product management with CRUD operations',
  'Product images and media upload',
  'Inventory tracking and stock management',
  'Product variants and pricing',
  'Bulk import/export functionality',
];

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">
          Manage products across tenants.
        </p>
      </div>
      <FeaturePlaceholder
        title="Products module (planned)"
        description="Coming soon once backend endpoints are available."
        plannedItems={plannedItems}
        badge="Planned"
      />
    </div>
  );
}


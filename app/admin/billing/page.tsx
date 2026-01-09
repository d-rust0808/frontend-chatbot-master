import { FeaturePlaceholder } from '@/components/feature-placeholder';

const plannedItems = [
  'Quản lý nạp tiền của khách hàng (tenants)',
  'Xem lịch sử giao dịch nạp tiền',
  'Thống kê doanh thu từ nạp tiền',
  'Xuất báo cáo billing',
];

export default function AdminBillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">
          Quản lý nạp tiền và giao dịch của khách hàng.
        </p>
      </div>
      <FeaturePlaceholder
        title="Billing module (planned)"
        description="Quản lý nạp tiền, lịch sử giao dịch và báo cáo billing cho tất cả tenants."
        plannedItems={plannedItems}
        badge="Planned"
      />
    </div>
  );
}

'use client';

import { IPBlacklist } from '@/components/ip-management/ip-blacklist';
import { IPWhitelist } from '@/components/ip-management/ip-whitelist';
import { AccessLogsViewer } from '@/components/access-logs/access-logs-viewer';
import { SuspiciousIPs } from '@/components/access-logs/suspicious-ips';

export default function IPManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">IP Management</h1>
        <p className="text-muted-foreground">
          Manage IP blacklist, whitelist, and monitor access logs. Whitelist has priority over blacklist.
        </p>
      </div>

      {/* IP Whitelist (shown first as it has priority) */}
      <IPWhitelist />

      {/* IP Blacklist */}
      <IPBlacklist />

      {/* Suspicious IPs Detection */}
      <SuspiciousIPs />

      {/* Access Logs Viewer */}
      <AccessLogsViewer />
    </div>
  );
}


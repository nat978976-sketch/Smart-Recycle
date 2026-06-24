'use client';

import { useCallback, useEffect, useState } from 'react';
import type { WasteReport } from '@/types';

interface UseShopReportStreamOptions {
  shopId: string;
  radiusKm?: number;
}

export function useShopReportStream({ shopId, radiusKm = 5 }: UseShopReportStreamOptions) {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newReportId, setNewReportId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ status: 'pending', shopId, radiusKm: String(radiusKm) });
    const source = new EventSource(`/api/waste-reports/stream?${params.toString()}`);

    source.onerror = () => setIsConnected(false);

    source.addEventListener('init', (event) => {
      setReports(JSON.parse((event as MessageEvent<string>).data));
      setIsConnected(true);
    });

    source.addEventListener('created', (event) => {
      const report: WasteReport = JSON.parse((event as MessageEvent<string>).data);
      setReports((prev) => [report, ...prev]);
      setNewReportId(report.id);
    });

    source.addEventListener('updated', (event) => {
      const updated: WasteReport = JSON.parse((event as MessageEvent<string>).data);
      setReports((prev) =>
        updated.status === 'pending'
          ? prev.map((report) => (report.id === updated.id ? updated : report))
          : prev.filter((report) => report.id !== updated.id)
      );
    });

    return () => source.close();
  }, [shopId, radiusKm]);

  const acceptReport = useCallback(
    async (reportId: string) => {
      await fetch(`/api/waste-reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted', acceptedByShopId: shopId }),
      });
    },
    [shopId]
  );

  const clearNewReportFlag = useCallback(() => setNewReportId(null), []);

  return { reports, isConnected, newReportId, clearNewReportFlag, acceptReport };
}

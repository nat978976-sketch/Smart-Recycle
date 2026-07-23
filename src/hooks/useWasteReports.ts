'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { WasteReport } from '@/types';
import { saveReportId } from '@/lib/reportHistory';

const POLL_INTERVAL_MS = 5000;

export function useWasteReports(status?: WasteReport['status'], onNewReport?: () => void) {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const onNewReportRef = useRef(onNewReport);
  onNewReportRef.current = onNewReport;

  const fetchReports = useCallback(async () => {
    const query = status ? `?status=${status}` : '';
    try {
      const response = await fetch(`/api/waste-reports${query}`);
      if (response.ok) {
        if (response.headers.get('x-new-report') === '1') {
          onNewReportRef.current?.();
        }
        setReports(await response.json());
      }
    } catch {
      // เซิร์ฟเวอร์เข้าถึงไม่ได้ชั่วคราว (เช่น dev server กำลังรีสตาร์ท) ข้ามรอบโพลนี้ไปก่อน
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchReports();
    // TODO: เมื่อย้ายไปใช้ Supabase ให้แทนที่ polling นี้ด้วย Supabase Realtime channel
    // เพื่ออัปเดตตำแหน่งขยะ/คำขอแบบ real-time ทันทีที่มีการเปลี่ยนแปลง
    const interval = setInterval(fetchReports, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchReports]);

  const submitReport = useCallback(
    async (report: Omit<WasteReport, 'id' | 'createdAt' | 'status'>) => {
      const response = await fetch('/api/waste-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      if (response.ok) {
        const created: WasteReport = await response.json();
        saveReportId(created.id);
        await fetchReports();
      }
    },
    [fetchReports]
  );

  const cancelReport = useCallback(
    async (id: string) => {
      const response = await fetch(`/api/waste-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (response.ok) await fetchReports();
    },
    [fetchReports]
  );

  return { reports, isLoading, submitReport, cancelReport, refetch: fetchReports };
}

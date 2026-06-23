import type { WasteReport } from '@/types';

declare global {
  // eslint-disable-next-line no-var
  var __wasteReportsStore: WasteReport[] | undefined;
}

// เก็บข้อมูลใน memory ของ process ฝั่งเซิร์ฟเวอร์เท่านั้น ใช้สำหรับ demo/dev
// เมื่อขึ้นโปรดักชันให้แทนที่ด้วยตาราง waste_reports ใน Supabase (ดู supabase/schema.sql)
export function getWasteReports(): WasteReport[] {
  if (!global.__wasteReportsStore) {
    global.__wasteReportsStore = [];
  }
  return global.__wasteReportsStore;
}

export function addWasteReport(report: WasteReport): void {
  getWasteReports().unshift(report);
}

export function updateWasteReport(id: string, patch: Partial<WasteReport>): WasteReport | null {
  const reports = getWasteReports();
  const index = reports.findIndex((report) => report.id === id);
  if (index === -1) return null;

  reports[index] = { ...reports[index], ...patch };
  return reports[index];
}

'use client';

import { useWasteReports } from '@/hooks/useWasteReports';
import { WASTE_TYPE_LABELS } from '@/types';

// TODO: เมื่อมี Supabase Auth ให้ดึง shop id ของผู้ใช้ที่ login จริง แทนค่า hardcode นี้
const CURRENT_SHOP_ID = 'shop-1';

export default function ShopDashboardPage() {
  const { reports, isLoading, refetch } = useWasteReports('pending');

  async function handleAccept(reportId: string) {
    await fetch(`/api/waste-reports/${reportId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted', acceptedByShopId: CURRENT_SHOP_ID }),
    });
    refetch();
  }

  return (
    <main className="mx-auto h-screen max-w-2xl overflow-y-auto p-4">
      <h1 className="mb-4 text-xl font-bold">คำขอรับขยะในเขตขอนแก่น</h1>

      {isLoading && <p className="text-gray-500">กำลังโหลด...</p>}
      {!isLoading && reports.length === 0 && <p className="text-gray-500">ยังไม่มีคำขอใหม่</p>}

      <ul className="space-y-3">
        {reports.map((report) => (
          <li key={report.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{WASTE_TYPE_LABELS[report.wasteType]}</span>
              <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleString('th-TH')}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              📍 {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
            </p>
            {report.note && <p className="mt-1 text-sm text-gray-500">หมายเหตุ: {report.note}</p>}
            <button
              type="button"
              onClick={() => handleAccept(report.id)}
              className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              รับงานนี้
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

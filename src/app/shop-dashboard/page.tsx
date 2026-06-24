'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useShopReportStream } from '@/hooks/useShopReportStream';
import { SEED_RECYCLING_SHOPS } from '@/lib/data/recyclingShops';
import { distanceKm } from '@/lib/geo/distance';
import { WASTE_TYPE_LABELS } from '@/types';

// โหลดแผนที่แบบ client-only เพราะ Leaflet ต้องใช้ window/document
const ShopReportsMap = dynamic(() => import('@/components/shop/ShopReportsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">กำลังโหลดแผนที่...</div>
  ),
});

// TODO: เมื่อมี Supabase Auth ให้ดึง shop id ของผู้ใช้ที่ login จริง แทนค่า hardcode นี้
const CURRENT_SHOP_ID = 'shop-1';
const NOTIFICATION_RADIUS_KM = 5;

function playNotificationBeep() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.25);
    oscillator.onended = () => ctx.close();
  } catch {
    // เบราว์เซอร์บางตัวบล็อกเสียงจนกว่าจะมี user interaction ก่อน ข้ามไปเงียบๆ
  }
}

export default function ShopDashboardPage() {
  const shop = SEED_RECYCLING_SHOPS.find((candidate) => candidate.id === CURRENT_SHOP_ID) ?? SEED_RECYCLING_SHOPS[0];
  const { reports, isConnected, newReportId, clearNewReportFlag, acceptReport } = useShopReportStream({
    shopId: shop.id,
    radiusKm: NOTIFICATION_RADIUS_KM,
  });

  const previousNewReportId = useRef<string | null>(null);

  useEffect(() => {
    if (newReportId && newReportId !== previousNewReportId.current) {
      previousNewReportId.current = newReportId;
      playNotificationBeep();
      const timeout = setTimeout(clearNewReportFlag, 4000);
      return () => clearTimeout(timeout);
    }
  }, [newReportId, clearNewReportFlag]);

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col">
      <header className="flex items-center justify-between p-4 pb-2">
        <h1 className="text-xl font-bold">คำขอรับขยะในเขตขอนแก่น</h1>
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          {isConnected ? 'เชื่อมต่อสด' : 'กำลังเชื่อมต่อ...'}
        </span>
      </header>

      {newReportId && (
        <div className="mx-4 mb-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          🔔 มีคำขอแจ้งขยะใหม่เข้ามา!
        </div>
      )}

      <div className="h-48 px-4">
        <div className="h-full w-full overflow-hidden rounded-xl border border-gray-200">
          <ShopReportsMap shop={shop} reports={reports} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {reports.length === 0 && (
          <p className="text-gray-500">ยังไม่มีคำขอใหม่ในระยะ {NOTIFICATION_RADIUS_KM} กม.</p>
        )}

        <ul className="space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition ${
                report.id === newReportId ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{WASTE_TYPE_LABELS[report.wasteType]}</span>
                <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleString('th-TH')}</span>
              </div>
              <p className="mt-1 text-sm text-gray-600">
                📍 {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)} · ห่างจากร้าน{' '}
                {distanceKm(shop, report).toFixed(1)} กม.
              </p>
              {report.note && <p className="mt-1 text-sm text-gray-500">หมายเหตุ: {report.note}</p>}
              {report.photoUrls.length > 0 && (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {report.photoUrls.map((url, index) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={url}
                      src={url}
                      alt={`รูปขยะ ${index + 1}`}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => acceptReport(report.id)}
                className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                รับงานนี้
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

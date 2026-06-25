'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useShopReportStream } from '@/hooks/useShopReportStream';
import { useRecyclingShops } from '@/hooks/useRecyclingShops';
import { distanceKm } from '@/lib/geo/distance';
import { getStoredShopId } from '@/lib/shopIdentity';
import { REPORT_STATUS_LABELS, WASTE_TYPE_LABELS } from '@/types';
import type { WasteReport } from '@/types';

// โหลดแผนที่แบบ client-only เพราะ Leaflet ต้องใช้ window/document
const ShopReportsMap = dynamic(() => import('@/components/shop/ShopReportsMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">กำลังโหลดแผนที่...</div>
  ),
});

// TODO: เมื่อมี Supabase Auth ให้ดึง shop id ของผู้ใช้ที่ login จริง แทนการเดาจาก localStorage นี้
const DEMO_FALLBACK_SHOP_ID = 'shop-1';
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

function openDirections(report: WasteReport) {
  window.open(
    `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`,
    '_blank',
    'noopener,noreferrer'
  );
}

export default function ShopDashboardPage() {
  const [shopId] = useState<string>(() => getStoredShopId() ?? DEMO_FALLBACK_SHOP_ID);
  const { shops, isLoading: isLoadingShops } = useRecyclingShops();
  const shop = shops.find((candidate) => candidate.id === shopId);

  const { reports, isConnected, newReportId, clearNewReportFlag, acceptReport, confirmTruckDispatch, completeReport } =
    useShopReportStream({ shopId, radiusKm: NOTIFICATION_RADIUS_KM });

  const previousNewReportId = useRef<string | null>(null);

  useEffect(() => {
    if (newReportId && newReportId !== previousNewReportId.current) {
      previousNewReportId.current = newReportId;
      playNotificationBeep();
      const timeout = setTimeout(clearNewReportFlag, 4000);
      return () => clearTimeout(timeout);
    }
  }, [newReportId, clearNewReportFlag]);

  async function handleConfirmDispatch(report: WasteReport) {
    await confirmTruckDispatch(report.id);
    openDirections(report);
  }

  if (isLoadingShops) {
    return <main className="flex h-screen items-center justify-center text-gray-500">กำลังโหลดข้อมูลร้าน...</main>;
  }

  if (!shop) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-3 p-5 text-center">
        <p className="text-gray-600">ไม่พบร้านค้าของคุณในระบบ ลงทะเบียนก่อนเพื่อเริ่มรับคำขอ</p>
        <Link
          href="/shop-register"
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
        >
          🏪 ลงทะเบียนร้านค้า
        </Link>
      </main>
    );
  }

  const pendingReports = reports.filter((report) => report.status === 'pending');
  const myActiveReports = reports.filter((report) => report.status !== 'pending');

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col">
      <header className="flex items-center justify-between p-4 pb-2">
        <div>
          <h1 className="text-xl font-bold">{shop.name}</h1>
          <p className="text-xs text-gray-400">คำขอรับขยะในเขตขอนแก่น</p>
        </div>
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
        {myActiveReports.length > 0 && (
          <section className="mb-5">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">🚚 งานที่ร้านคุณรับไว้</h2>
            <ul className="space-y-3">
              {myActiveReports.map((report) => (
                <li
                  key={report.id}
                  className="rounded-xl border border-purple-200 bg-purple-50 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{WASTE_TYPE_LABELS[report.wasteType]}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(report.createdAt).toLocaleString('th-TH')}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-purple-700">
                    {REPORT_STATUS_LABELS[report.status]}
                  </p>
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

                  {report.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => handleConfirmDispatch(report)}
                      className="mt-3 w-full rounded-lg bg-purple-600 py-2 text-sm font-semibold text-white hover:bg-purple-700"
                    >
                      ✅ ยืนยันเรียกรถมารับซื้อจุดนี้
                    </button>
                  )}

                  {report.status === 'truck_dispatched' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openDirections(report)}
                        className="flex-1 rounded-lg border border-purple-300 bg-white py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50"
                      >
                        🧭 เปิดแผนที่นำทาง
                      </button>
                      <button
                        type="button"
                        onClick={() => completeReport(report.id)}
                        className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        🏁 เก็บเรียบร้อยแล้ว
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            🆕 คำขอใหม่ในระยะ {NOTIFICATION_RADIUS_KM} กม.
          </h2>
          {pendingReports.length === 0 && <p className="text-gray-500">ยังไม่มีคำขอใหม่</p>}

          <ul className="space-y-3">
            {pendingReports.map((report) => (
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
        </section>
      </div>
    </main>
  );
}

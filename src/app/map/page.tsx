'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useWasteReports } from '@/hooks/useWasteReports';
import { useRecyclingShops } from '@/hooks/useRecyclingShops';
import { getStoredShopId } from '@/lib/shopIdentity';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-gray-500">กำลังโหลดแผนที่...</div>
  ),
});

export default function MapPage() {
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const handleNewReport = useCallback(() => {
    showToast('🔔 มีคำขอใหม่เข้ามา!');
  }, [showToast]);

  const { reports, submitReport, cancelReport } = useWasteReports(undefined, handleNewReport);
  const { shops } = useRecyclingShops();

  const [registeredShopId, setRegisteredShopId] = useState<string | null>(null);
  useEffect(() => {
    setRegisteredShopId(getStoredShopId());
  }, []);

  return (
    <main className="relative h-screen w-screen">
      <MapView wasteReports={reports} recyclingShops={shops} onSubmitReport={submitReport} onCancelReport={cancelReport} />

      {registeredShopId ? (
        <Link
          href="/shop-dashboard"
          className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-md hover:bg-emerald-700"
        >
          🔔 แจ้งเตือนร้านค้า
        </Link>
      ) : (
        <Link
          href="/shop-register"
          className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-white px-3 py-2 text-sm font-medium text-emerald-700 shadow-md hover:bg-emerald-50"
        >
          🏪 สมัครร้านค้า
        </Link>
      )}

      <Link
        href="/admin"
        title="จัดการเว็บไซต์"
        className="absolute right-3 top-3 z-[1000] rounded-full bg-white p-2 text-base shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        ⚙️
      </Link>

      {toast && (
        <div
          className="absolute bottom-36 left-1/2 z-[2000] -translate-x-1/2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-xl"
          onClick={() => setToast(null)}
        >
          {toast}
        </div>
      )}
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useWasteReports } from '@/hooks/useWasteReports';
import { useRecyclingShops } from '@/hooks/useRecyclingShops';
import { getStoredShopId } from '@/lib/shopIdentity';

// โหลด MapView แบบ client-only เพราะ Leaflet ต้องใช้ window/document
const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-gray-500">กำลังโหลดแผนที่...</div>
  ),
});

export default function HomePage() {
  const { reports, submitReport } = useWasteReports();
  const { shops } = useRecyclingShops();

  // ปุ่มนี้สำหรับร้านค้าเท่านั้น: ถ้าเบราว์เซอร์นี้เคยสมัครร้านไว้แล้วให้พาเข้าหน้าแจ้งเตือนของร้านโดยตรง
  // ไม่ต้องวนไปกรอกฟอร์มสมัครซ้ำ
  const [registeredShopId, setRegisteredShopId] = useState<string | null>(null);
  useEffect(() => {
    setRegisteredShopId(getStoredShopId());
  }, []);

  return (
    <main className="relative h-screen w-screen">
      <MapView wasteReports={reports} recyclingShops={shops} onSubmitReport={submitReport} />

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
        className="absolute right-3 top-3 z-[1000] rounded-full bg-white p-2 text-base shadow-md hover:bg-gray-50"
      >
        ⚙️
      </Link>
    </main>
  );
}

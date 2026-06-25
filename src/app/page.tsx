'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useWasteReports } from '@/hooks/useWasteReports';
import { useRecyclingShops } from '@/hooks/useRecyclingShops';

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

  return (
    <main className="relative h-screen w-screen">
      <MapView wasteReports={reports} recyclingShops={shops} onSubmitReport={submitReport} />

      <Link
        href="/shop-register"
        className="absolute bottom-6 left-3 z-[1000] rounded-full bg-white px-3 py-2 text-sm font-medium text-emerald-700 shadow-md hover:bg-emerald-50"
      >
        🏪 สมัครร้านค้า
      </Link>
    </main>
  );
}

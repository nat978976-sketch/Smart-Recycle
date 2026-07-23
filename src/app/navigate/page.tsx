'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useState } from 'react';
import { useRecyclingShops } from '@/hooks/useRecyclingShops';
import type { RecyclingShop } from '@/types';

const NavigationMap = dynamic(() => import('@/components/map/NavigationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">กำลังโหลดแผนที่...</div>
  ),
});

export default function NavigatePage() {
  const { shops } = useRecyclingShops();
  const [selected, setSelected] = useState<{ shop: RecyclingShop; distanceKm: number } | null>(null);
  const [nearest, setNearest] = useState<{ shop: RecyclingShop; distanceKm: number } | null>(null);

  const handleSelect = useCallback((shop: RecyclingShop, distanceKm: number) => {
    setSelected({ shop, distanceKm });
  }, []);

  const handleNearest = useCallback((shop: RecyclingShop, distanceKm: number) => {
    setNearest({ shop, distanceKm });
    setSelected({ shop, distanceKm });
  }, []);

  return (
    <main className="relative h-screen w-screen bg-gray-100 dark:bg-gray-950">
      <Link
        href="/"
        className="absolute left-3 top-3 z-[1000] rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
      >
        ← กลับ
      </Link>

      <p className="absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-md dark:bg-gray-800 dark:text-gray-200">
        🧭 นำทางหาร้านรับซื้อ
      </p>

      <div className="h-full w-full">
        <NavigationMap shops={shops} onSelectShop={handleSelect} onNearestShop={handleNearest} />
      </div>

      {!selected && (
        <div className="absolute bottom-6 left-1/2 z-[1000] w-[90vw] max-w-sm -translate-x-1/2 rounded-2xl bg-white px-5 py-4 shadow-xl dark:bg-gray-900">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            กดที่ <span className="font-semibold text-emerald-600 dark:text-emerald-400">หมุดร้านค้า ♻️</span> บนแผนที่<br />เพื่อดูข้อมูลและนำทาง
          </p>
        </div>
      )}

      {selected && (
        <div className="absolute bottom-6 left-1/2 z-[1000] w-[90vw] max-w-sm -translate-x-1/2 rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-base font-bold text-gray-900 dark:text-white">{selected.shop.name}</p>
                {nearest?.shop.id === selected.shop.id && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                    ใกล้สุด
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {selected.distanceKm > 0
                  ? selected.distanceKm < 1
                    ? `ห่าง ${Math.round(selected.distanceKm * 1000)} เมตร`
                    : `ห่าง ${selected.distanceKm.toFixed(1)} กม.`
                  : 'กดอนุญาตตำแหน่งเพื่อดูระยะทาง'}
              </p>
              {selected.shop.phone && (
                <a href={`tel:${selected.shop.phone}`} className="mt-0.5 flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400">
                  📞 {selected.shop.phone}
                </a>
              )}
            </div>
            <button type="button" onClick={() => setSelected(null)}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800">✕</button>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selected.shop.latitude},${selected.shop.longitude}`}
            target="_blank" rel="noopener noreferrer"
            className="block w-full rounded-full bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
          >
            🗺️ เปิดนำทางใน Google Maps
          </a>
        </div>
      )}
    </main>
  );
}

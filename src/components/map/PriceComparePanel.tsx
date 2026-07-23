'use client';

import { useState } from 'react';
import { WASTE_TYPE_LABELS } from '@/types';
import type { Coordinates, RecyclingShop, WasteType } from '@/types';
import { distanceKm } from '@/lib/geo/distance';

const WASTE_EMOJI: Record<WasteType, string> = {
  plastic: '🧴', paper: '📄', glass: '🍶', metal: '🔩',
  electronic: '💻', organic: '🥬', mixed: '🗑️',
};

interface Props {
  shops: RecyclingShop[];
  userPosition: Coordinates | null;
  onClose: () => void;
}

export default function PriceComparePanel({ shops, userPosition, onClose }: Props) {
  const [selectedType, setSelectedType] = useState<WasteType>('plastic');

  const sortedShops = shops
    .filter((s) => s.isActive && s.acceptedWasteTypes.includes(selectedType))
    .map((s) => ({
      ...s,
      price: s.pricePerKg?.[selectedType],
      distance: userPosition ? distanceKm(userPosition, s) : null,
    }))
    .sort((a, b) => {
      // เรียงจากราคาสูงสุด ถ้าไม่มีราคาไปท้าย
      if (a.price === undefined && b.price === undefined) return 0;
      if (a.price === undefined) return 1;
      if (b.price === undefined) return -1;
      return b.price - a.price;
    });

  const allTypes = Array.from(
    new Set(shops.flatMap((s) => s.acceptedWasteTypes))
  ) as WasteType[];

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-t-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">💹 เปรียบเทียบราคา</h2>
          <button type="button" onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100">✕</button>
        </div>

        {/* Waste type tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3 pb-2 scrollbar-none">
          {allTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                selectedType === type
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {WASTE_EMOJI[type]} {WASTE_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Shop list */}
        <div className="max-h-[55vh] overflow-y-auto px-4 pb-4">
          {sortedShops.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">ไม่มีร้านที่รับซื้อประเภทนี้</p>
          ) : (
            <ul className="space-y-2">
              {/* column header */}
              <li className="flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                <span>ร้านค้า</span>
                <span>ราคา/กก.</span>
              </li>
              {sortedShops.map((shop, i) => (
                <li key={shop.id}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${
                    i === 0 ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-gray-50'
                  }`}>
                  <div>
                    <div className="flex items-center gap-1.5">
                      {i === 0 && <span className="text-xs font-bold text-emerald-600">🏆</span>}
                      <p className="text-sm font-semibold text-gray-800">{shop.name}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {shop.distance !== null
                        ? shop.distance < 1
                          ? `${Math.round(shop.distance * 1000)} ม.`
                          : `${shop.distance.toFixed(1)} กม.`
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-bold ${
                      shop.price !== undefined ? 'text-emerald-700' : 'text-gray-400'
                    }`}>
                      {shop.price !== undefined ? `฿${shop.price}` : 'ไม่ระบุ'}
                    </span>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      className="rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      นำทาง
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

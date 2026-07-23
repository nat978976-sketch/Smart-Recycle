'use client';

import type { RecyclingShop, WasteType } from '@/types';
import { WASTE_TYPE_LABELS } from '@/types';

const WASTE_CHIP_STYLE: Record<WasteType, string> = {
  plastic:    'bg-blue-100 text-blue-700',
  paper:      'bg-yellow-100 text-yellow-700',
  glass:      'bg-cyan-100 text-cyan-700',
  metal:      'bg-gray-200 text-gray-600',
  electronic: 'bg-purple-100 text-purple-700',
  organic:    'bg-green-100 text-green-700',
  mixed:      'bg-orange-100 text-orange-700',
};

const WASTE_EMOJI: Record<WasteType, string> = {
  plastic:    '🧴',
  paper:      '📄',
  glass:      '🍶',
  metal:      '🔩',
  electronic: '💻',
  organic:    '🥬',
  mixed:      '🗑️',
};

interface ShopDetailModalProps {
  shop: RecyclingShop;
  onClose: () => void;
}

export default function ShopDetailModal({ shop, onClose }: ShopDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40 sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">♻️</span>
              <h2 className="text-lg font-bold text-gray-900">{shop.name}</h2>
            </div>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                shop.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {shop.isActive ? '● เปิดรับซื้อ' : '○ ปิดชั่วคราว'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="ปิด"
          >
            ✕
          </button>
        </div>

        {/* ประเภทขยะที่รับ */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">รับซื้อ / ราคา</p>
        <div className="mb-4 space-y-1.5">
          {shop.acceptedWasteTypes.map((type) => {
            const price = shop.pricePerKg?.[type];
            return (
              <div key={type} className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${WASTE_CHIP_STYLE[type]}`}>
                  {WASTE_EMOJI[type]} {WASTE_TYPE_LABELS[type]}
                </span>
                <span className={`text-sm font-semibold ${price !== undefined ? 'text-emerald-700' : 'text-gray-400'}`}>
                  {price !== undefined ? `฿${price}/กก.` : 'ไม่ระบุ'}
                </span>
              </div>
            );
          })}
        </div>

        {/* ข้อมูลติดต่อ */}
        <div className="mb-4 space-y-1.5 rounded-xl bg-gray-50 px-4 py-3">
          {shop.phone && (
            <a
              href={`tel:${shop.phone}`}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-600"
            >
              <span>📞</span>
              <span className="font-medium">{shop.phone}</span>
            </a>
          )}
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span>📍</span>
            <span>{shop.latitude.toFixed(5)}, {shop.longitude.toFixed(5)}</span>
          </p>
        </div>

        {/* ปุ่มนำทาง */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-full bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
        >
          🗺️ นำทางไปร้านนี้
        </a>
      </div>
    </div>
  );
}

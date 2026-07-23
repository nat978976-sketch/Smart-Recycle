'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RecyclingShop, ShopReview, WasteType } from '@/types';
import { WASTE_TYPE_LABELS } from '@/types';

const WASTE_CHIP_STYLE: Record<WasteType, string> = {
  plastic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  paper: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  glass: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  metal: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  electronic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  organic: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  mixed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

const WASTE_EMOJI: Record<WasteType, string> = {
  plastic: '🧴', paper: '📄', glass: '🍶', metal: '🔩',
  electronic: '💻', organic: '🥬', mixed: '🗑️',
};

function Stars({ rating, onSelect }: { rating: number; onSelect?: (r: number) => void }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s}
          className={`text-base leading-none ${s <= rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'} ${onSelect ? 'cursor-pointer' : ''}`}
          onClick={() => onSelect?.(s)}>★</span>
      ))}
    </span>
  );
}

function timeAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'วันนี้';
  if (days < 7) return `${days} วันที่แล้ว`;
  if (days < 30) return `${Math.floor(days / 7)} สัปดาห์ที่แล้ว`;
  return `${Math.floor(days / 30)} เดือนที่แล้ว`;
}

interface ShopDetailModalProps { shop: RecyclingShop; onClose: () => void; }

export default function ShopDetailModal({ shop, onClose }: ShopDetailModalProps) {
  const [reviews, setReviews] = useState<ShopReview[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formAuthor, setFormAuthor] = useState('');
  const [formComment, setFormComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    const res = await fetch(`/api/reviews?shopId=${shop.id}`);
    if (res.ok) setReviews(await res.json());
  }, [shop.id]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function handleSubmitReview() {
    if (!formComment.trim()) return;
    setIsSubmitting(true);
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shopId: shop.id, rating: formRating, author: formAuthor || 'ไม่ระบุชื่อ', comment: formComment }),
    });
    setFormComment(''); setFormAuthor(''); setFormRating(5); setShowForm(false); setIsSubmitting(false);
    await fetchReviews();
  }

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  const visible = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40 sm:items-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl dark:bg-gray-900 sm:rounded-2xl">

        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">♻️</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{shop.name}</h2>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${shop.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                {shop.isActive ? '● เปิดรับซื้อ' : '○ ปิดชั่วคราว'}
              </span>
              {avgRating !== null && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Stars rating={Math.round(avgRating)} />
                  <span className="font-semibold text-amber-500">{avgRating.toFixed(1)}</span>
                  <span>({reviews.length})</span>
                </span>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="mt-0.5 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800" aria-label="ปิด">✕</button>
        </div>

        {/* ราคา */}
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">รับซื้อ / ราคา</p>
        <div className="mb-4 space-y-1.5">
          {shop.acceptedWasteTypes.map((type) => {
            const price = shop.pricePerKg?.[type];
            return (
              <div key={type} className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${WASTE_CHIP_STYLE[type]}`}>
                  {WASTE_EMOJI[type]} {WASTE_TYPE_LABELS[type]}
                </span>
                <span className={`text-sm font-semibold ${price !== undefined ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {price !== undefined ? `฿${price}/กก.` : 'ไม่ระบุ'}
                </span>
              </div>
            );
          })}
        </div>

        {/* ข้อมูลติดต่อ */}
        <div className="mb-4 space-y-1.5 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
          {shop.phone && (
            <a href={`tel:${shop.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400">
              <span>📞</span><span className="font-medium">{shop.phone}</span>
            </a>
          )}
          <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>📍</span><span>{shop.latitude.toFixed(5)}, {shop.longitude.toFixed(5)}</span>
          </p>
        </div>

        {/* ปุ่มนำทาง */}
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`}
          target="_blank" rel="noopener noreferrer"
          className="mb-5 block w-full rounded-full bg-blue-600 py-3 text-center font-semibold text-white transition hover:bg-blue-700">
          🗺️ นำทางไปร้านนี้
        </a>

        {/* รีวิว */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">รีวิวจากผู้ใช้ ({reviews.length})</p>
          {!showForm && (
            <button type="button" onClick={() => setShowForm(true)}
              className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50">
              + เขียนรีวิว
            </button>
          )}
        </div>

        {/* ฟอร์มรีวิว */}
        {showForm && (
          <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
            <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">คะแนนของคุณ</p>
            <div className="mb-3 flex gap-1">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button" onClick={() => setFormRating(s)}
                  className={`text-2xl leading-none transition ${s <= formRating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}>★</button>
              ))}
            </div>
            <input type="text" placeholder="ชื่อ (ไม่บังคับ)" value={formAuthor} onChange={(e) => setFormAuthor(e.target.value)}
              className="mb-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" />
            <textarea placeholder="แชร์ประสบการณ์ของคุณ..." value={formComment} onChange={(e) => setFormComment(e.target.value)} rows={3}
              className="mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">ยกเลิก</button>
              <button type="button" onClick={handleSubmitReview} disabled={isSubmitting || !formComment.trim()}
                className="flex-1 rounded-full bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-700">
                {isSubmitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
              </button>
            </div>
          </div>
        )}

        {/* รายการรีวิว */}
        {reviews.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400 dark:text-gray-500">ยังไม่มีรีวิว เป็นคนแรกที่รีวิวร้านนี้!</p>
        ) : (
          <ul className="space-y-3">
            {visible.map((r) => (
              <li key={r.id} className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{r.author}</span>
                    <Stars rating={r.rating} />
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
        {reviews.length > 3 && (
          <button type="button" onClick={() => setShowAll((v) => !v)}
            className="mt-3 w-full rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800">
            {showAll ? 'แสดงน้อยลง' : `ดูทั้งหมด ${reviews.length} รีวิว`}
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import { storeShopId } from '@/lib/shopIdentity';
import { WASTE_TYPE_LABELS } from '@/types';
import type { WasteType } from '@/types';

// ราคาอ้างอิงตลาดรับซื้อของเก่าในไทย (บาท/กก.) — ปรับได้ตามจริง
const REFERENCE_PRICE: Partial<Record<WasteType, number>> = {
  plastic:    5,
  paper:      2,
  glass:      1,
  metal:      8,
  electronic: 30,
  organic:    0,
  mixed:      1,
};

export default function ShopRegisterPage() {
  const router = useRouter();
  const { latitude, longitude, error: geoError, isLoading: isLocating } = useGeolocation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedWasteTypes, setAcceptedWasteTypes] = useState<WasteType[]>([]);
  const [pricePerKg, setPricePerKg] = useState<Partial<Record<WasteType, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function toggleWasteType(type: WasteType) {
    setAcceptedWasteTypes((prev) => {
      if (prev.includes(type)) {
        setPricePerKg((p) => { const next = { ...p }; delete next[type]; return next; });
        return prev.filter((t) => t !== type);
      }
      // ใส่ราคาอ้างอิงเป็น default เมื่อเลือก
      const ref = REFERENCE_PRICE[type];
      if (ref !== undefined) setPricePerKg((p) => ({ ...p, [type]: String(ref) }));
      return [...prev, type];
    });
  }

  function setPrice(type: WasteType, value: string) {
    setPricePerKg((prev) => ({ ...prev, [type]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (latitude === null || longitude === null) {
      setSubmitError('ยังไม่พบตำแหน่งร้าน กรุณาเปิดสิทธิ์เข้าถึงตำแหน่งแล้วลองใหม่');
      return;
    }
    if (acceptedWasteTypes.length === 0) {
      setSubmitError('กรุณาเลือกประเภทขยะที่รับซื้ออย่างน้อย 1 ประเภท');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/recycling-shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: phone || undefined,
          latitude,
          longitude,
          acceptedWasteTypes,
          pricePerKg: Object.fromEntries(
            Object.entries(pricePerKg)
              .filter(([, v]) => v !== '' && !isNaN(Number(v)))
              .map(([k, v]) => [k, Number(v)])
          ),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'สมัครไม่สำเร็จ กรุณาลองใหม่');
      }

      const shop = await response.json();
      storeShopId(shop.id);
      router.push('/shop-dashboard');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'สมัครไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col p-5">
      <h1 className="mb-1 text-xl font-bold text-gray-900">🏪 ลงทะเบียนร้านรับซื้อของเก่า</h1>
      <p className="mb-5 text-sm text-gray-500">
        สมัครเข้าร่วมเครือข่ายเพื่อรับการแจ้งขยะจากประชาชนในระยะใกล้ร้านคุณ
      </p>

      <form onSubmit={handleSubmit}>
        <label className="mb-1 block text-sm font-medium text-gray-700">ชื่อร้าน</label>
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="เช่น เจ้าพระยาค้าเศษ"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">เบอร์โทร (ถ้ามี)</label>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="08x-xxx-xxxx"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
        />

        <label className="mb-2 block text-sm font-medium text-gray-700">ประเภทขยะที่รับซื้อ และราคา (บาท/กก.)</label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {Object.entries(WASTE_TYPE_LABELS).map(([value, label]) => {
            const type = value as WasteType;
            const checked = acceptedWasteTypes.includes(type);
            return (
              <div
                key={type}
                className={`rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'}`}
              >
                <label className="flex cursor-pointer items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleWasteType(type)}
                    className="accent-emerald-600"
                  />
                  <span className="font-medium">{label}</span>
                </label>
                {checked && (
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="text-xs text-gray-400">฿</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="ราคา/กก."
                      value={pricePerKg[type] ?? ''}
                      onChange={(e) => setPrice(type, e.target.value)}
                      className="w-full rounded border border-gray-300 px-2 py-0.5 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="text-xs text-gray-400">/กก.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700">ตำแหน่งร้าน</label>
        <p className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          {isLocating && '📍 กำลังค้นหาตำแหน่งปัจจุบัน...'}
          {!isLocating && latitude !== null && longitude !== null && (
            <>📍 {latitude.toFixed(5)}, {longitude.toFixed(5)} (ใช้ตำแหน่งปัจจุบันของอุปกรณ์นี้)</>
          )}
          {!isLocating && geoError && <span className="text-red-600">ไม่สามารถเข้าถึงตำแหน่งได้: {geoError}</span>}
        </p>

        {submitError && <p className="mb-3 text-sm text-red-600">{submitError}</p>}

        <button
          type="submit"
          disabled={isSubmitting || isLocating}
          className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'กำลังสมัคร...' : 'สมัครร้านค้า'}
        </button>
      </form>
    </main>
  );
}

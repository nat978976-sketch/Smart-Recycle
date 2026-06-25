'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useGeolocation } from '@/hooks/useGeolocation';
import { storeShopId } from '@/lib/shopIdentity';
import { WASTE_TYPE_LABELS } from '@/types';
import type { WasteType } from '@/types';

export default function ShopRegisterPage() {
  const router = useRouter();
  const { latitude, longitude, error: geoError, isLoading: isLocating } = useGeolocation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedWasteTypes, setAcceptedWasteTypes] = useState<WasteType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function toggleWasteType(type: WasteType) {
    setAcceptedWasteTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
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
        body: JSON.stringify({ name, phone: phone || undefined, latitude, longitude, acceptedWasteTypes }),
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

        <label className="mb-2 block text-sm font-medium text-gray-700">ประเภทขยะที่รับซื้อ</label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {Object.entries(WASTE_TYPE_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={acceptedWasteTypes.includes(value as WasteType)}
                onChange={() => toggleWasteType(value as WasteType)}
              />
              {label}
            </label>
          ))}
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

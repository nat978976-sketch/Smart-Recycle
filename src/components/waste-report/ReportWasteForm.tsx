'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { classifyWasteImage } from '@/lib/ai/classifyWaste';
import { calcCo2Saved } from '@/lib/co2Calculator';
import { addEcoStat } from '@/lib/personalStats';
import type { Coordinates, RecyclingShop, WasteReport, WasteType } from '@/types';
import { WASTE_TYPE_LABELS } from '@/types';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface ReportWasteFormProps {
  initialPosition: Coordinates;
  onClose: () => void;
  onSubmit: (report: Omit<WasteReport, 'id' | 'createdAt' | 'status'>) => Promise<void> | void;
  shopPrices?: Partial<Record<WasteType, number>>;
  shopName?: string;
  allShops?: RecyclingShop[];
}

const WASTE_EMOJI: Record<WasteType, string> = {
  plastic: '🧴', paper: '📄', glass: '🍶', metal: '🔩',
  electronic: '💻', organic: '🥬', mixed: '🗑️',
};

const STEPS = [
  { label: 'ส่งคำขอแล้ว', done: true },
  { label: 'รอร้านรับงาน', done: false },
  { label: 'รถออกเดินทาง', done: false },
  { label: 'รับของเสร็จสิ้น', done: false },
];

export default function ReportWasteForm({
  initialPosition, onClose, onSubmit, shopPrices, shopName, allShops,
}: ReportWasteFormProps) {
  const [wasteType, setWasteType] = useState<WasteType>('plastic');
  const [weightKg, setWeightKg] = useState('');
  const [note, setNote] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    wasteType: WasteType; earning: number | null; co2Kg: number | null; shopName?: string; refNo: string;
  } | null>(null);

  const pricePerKg = shopPrices?.[wasteType];
  const weight = weightKg !== '' && Number(weightKg) > 0 ? Number(weightKg) : null;
  const estimatedEarning = pricePerKg !== undefined && weight !== null ? pricePerKg * weight : null;
  const estimatedCo2 = weight !== null ? calcCo2Saved(wasteType, weight) : null;

  const bestShop = useMemo(() => {
    if (!allShops?.length) return null;
    return allShops
      .filter((s) => s.pricePerKg?.[wasteType] !== undefined)
      .sort((a, b) => (b.pricePerKg![wasteType]! - a.pricePerKg![wasteType]!))
      .at(0) ?? null;
  }, [allShops, wasteType]);

  const showBestPriceBanner = bestShop && bestShop.name !== shopName;

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    setPreviewUrls(await Promise.all(files.map(readFileAsDataUrl)));
    setIsClassifying(true); setAiSuggestion(null);
    try {
      const result = await classifyWasteImage(files[0]);
      setWasteType(result.wasteType);
      setAiSuggestion(`AI คาดเดาว่าเป็น "${WASTE_TYPE_LABELS[result.wasteType]}" (ความมั่นใจ ${(result.confidence * 100).toFixed(0)}%)`);
    } catch {
      setAiSuggestion('ไม่สามารถวิเคราะห์รูปภาพได้ในขณะนี้ กรุณาเลือกประเภทขยะด้วยตนเอง');
    } finally { setIsClassifying(false); }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true); setSubmitError(null);
    try {
      await onSubmit({
        userId: 'current-user', wasteType, photoUrls: previewUrls,
        latitude: initialPosition.latitude, longitude: initialPosition.longitude,
        note: note || undefined, acceptedByShopId: null,
      });
      if (weight !== null) addEcoStat(wasteType, weight, estimatedEarning ?? 0);
      setSuccessInfo({ wasteType, earning: estimatedEarning, co2Kg: estimatedCo2, shopName, refNo: `SR-${Date.now().toString().slice(-6)}` });
    } catch {
      setSubmitError('ส่งคำขอไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่');
    } finally { setIsSubmitting(false); }
  }

  if (successInfo) {
    return (
      <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40 sm:items-center">
        <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl dark:bg-gray-900 sm:rounded-2xl">
          <div className="mb-4 flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-5xl shadow-md dark:bg-emerald-900/40">✅</div>
            <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">ส่งคำขอเรียบร้อยแล้ว!</h2>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">หมายเลขอ้างอิง: {successInfo.refNo}</p>
          </div>

          <div className="mb-5 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{WASTE_EMOJI[successInfo.wasteType]}</span>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{WASTE_TYPE_LABELS[successInfo.wasteType]}</p>
                  {successInfo.shopName && <p className="text-xs text-gray-500 dark:text-gray-400">ร้านใกล้สุด: {successInfo.shopName}</p>}
                </div>
              </div>
              <div className="space-y-0.5 text-right">
                {successInfo.earning !== null && (
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">ประมาณการ</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">≈ ฿{successInfo.earning.toFixed(0)}</p>
                  </div>
                )}
                {successInfo.co2Kg !== null && (
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">ช่วยลด CO₂</p>
                    <p className="text-sm font-bold text-teal-600 dark:text-teal-400">≈ {successInfo.co2Kg.toFixed(1)} กก.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-start justify-between">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex flex-1 flex-col items-center">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <p className="mt-1 px-0.5 text-center text-[10px] leading-tight text-gray-500 dark:text-gray-400">{step.label}</p>
                </div>
              ))}
            </div>
            <div className="relative -top-10 mx-3 flex items-center" style={{ marginBottom: '-40px' }}>
              <div className="h-0.5 flex-1 bg-emerald-400" />
              <div className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700" />
              <div className="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>

          <p className="mb-5 text-center text-sm text-gray-500 dark:text-gray-400">
            ร้านค้าจะตอบรับและส่งรถออกมารับของ<br />กรุณารอที่จุดที่กำหนดไว้
          </p>
          <button type="button" onClick={onClose}
            className="w-full rounded-full bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700">
            กลับสู่แผนที่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40 sm:items-center">
      <form onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl dark:bg-gray-900 sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">แจ้งขาย / เรียกรถรับซื้อของเก่า</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" aria-label="ปิด">✕</button>
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ประเภทขยะ</label>
        <select value={wasteType} onChange={(e) => setWasteType(e.target.value as WasteType)}
          className="mb-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white">
          {Object.entries(WASTE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {aiSuggestion && <p className="mb-2 text-xs text-emerald-700 dark:text-emerald-400">{aiSuggestion}</p>}

        {showBestPriceBanner && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800/50 dark:bg-amber-900/20">
            <span className="text-base">🏆</span>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              <strong>{bestShop!.name}</strong> ให้ราคาดีที่สุด&nbsp;
              <span className="font-bold text-amber-700 dark:text-amber-400">฿{bestShop!.pricePerKg![wasteType]}/กก.</span>
              {shopName && <span className="text-amber-600 dark:text-amber-500"> (ร้านใกล้สุดของคุณคือ {shopName})</span>}
            </p>
          </div>
        )}

        <label className="mb-1 mt-2 block text-sm font-medium text-gray-700 dark:text-gray-300">น้ำหนักโดยประมาณ (กก.)</label>
        <input type="number" min="0.1" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)}
          placeholder="เช่น 5"
          className="mb-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" />

        {weight !== null ? (
          <div className="mb-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-900/20">
            <div className="flex items-center justify-between">
              <div>
                {estimatedEarning !== null ? (
                  <span className="text-gray-600 dark:text-gray-300">
                    คาดว่าได้รับ <span className="ml-1 font-bold text-emerald-700 dark:text-emerald-400">≈ ฿{estimatedEarning.toFixed(0)}</span>
                    {shopName && <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">จาก {shopName}</span>}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">ร้านใกล้สุดไม่ระบุราคาสำหรับขยะประเภทนี้</span>
                )}
              </div>
              <span className="text-xs font-medium text-teal-600 dark:text-teal-400">🌿 ลด CO₂ ≈ {estimatedCo2!.toFixed(1)} กก.</span>
            </div>
          </div>
        ) : <div className="mb-3" />}

        <label className="mb-1 mt-3 block text-sm font-medium text-gray-700 dark:text-gray-300">รูปถ่าย (สำหรับวิเคราะห์ด้วย AI)</label>
        <input type="file" accept="image/*" multiple capture="environment" onChange={handlePhotoChange}
          className="mb-2 block w-full text-sm text-gray-600 dark:text-gray-400" />
        {isClassifying && <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">กำลังวิเคราะห์รูปภาพด้วย AI...</p>}
        {previewUrls.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto">
            {previewUrls.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt={`รูปขยะ ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
            ))}
          </div>
        )}

        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">จุดที่ต้องการให้มารับ</label>
        <p className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          📌 {initialPosition.latitude.toFixed(5)}, {initialPosition.longitude.toFixed(5)}
        </p>

        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">หมายเหตุ (ถ้ามี)</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
          placeholder="เช่น จุดสังเกต, ปริมาณขยะโดยประมาณ"
          className="mb-4 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500" />

        {submitError && <p className="mb-3 text-sm text-red-600 dark:text-red-400">{submitError}</p>}

        <button type="submit" disabled={isSubmitting}
          className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:bg-gray-400 dark:disabled:bg-gray-600">
          {isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเรียกรถรับซื้อของเก่า'}
        </button>
      </form>
    </div>
  );
}

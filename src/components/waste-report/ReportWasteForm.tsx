'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { classifyWasteImage } from '@/lib/ai/classifyWaste';
import type { Coordinates, WasteReport, WasteType } from '@/types';
import { WASTE_TYPE_LABELS } from '@/types';

interface ReportWasteFormProps {
  initialPosition: Coordinates;
  onClose: () => void;
  onSubmit: (report: Omit<WasteReport, 'id' | 'createdAt' | 'status'>) => Promise<void> | void;
}

export default function ReportWasteForm({ initialPosition, onClose, onSubmit }: ReportWasteFormProps) {
  const [wasteType, setWasteType] = useState<WasteType>('plastic');
  const [note, setNote] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
    setIsClassifying(true);
    setAiSuggestion(null);

    try {
      const result = await classifyWasteImage(files[0]);
      setWasteType(result.wasteType);
      setAiSuggestion(
        `AI คาดเดาว่าเป็น "${WASTE_TYPE_LABELS[result.wasteType]}" (ความมั่นใจ ${(result.confidence * 100).toFixed(0)}%)`
      );
    } catch {
      setAiSuggestion('ไม่สามารถวิเคราะห์รูปภาพได้ในขณะนี้ กรุณาเลือกประเภทขยะด้วยตนเอง');
    } finally {
      setIsClassifying(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        userId: 'current-user',
        wasteType,
        photoUrls: previewUrls,
        latitude: initialPosition.latitude,
        longitude: initialPosition.longitude,
        note: note || undefined,
        acceptedByShopId: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">รายงานขยะ / เรียกรถเก็บขยะ</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="ปิด">
            ✕
          </button>
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700">ประเภทขยะ</label>
        <select
          value={wasteType}
          onChange={(event) => setWasteType(event.target.value as WasteType)}
          className="mb-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
        >
          {Object.entries(WASTE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {aiSuggestion && <p className="mb-3 text-xs text-emerald-700">{aiSuggestion}</p>}

        <label className="mb-1 mt-3 block text-sm font-medium text-gray-700">
          รูปถ่าย (สำหรับวิเคราะห์ด้วย AI)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          capture="environment"
          onChange={handlePhotoChange}
          className="mb-2 block w-full text-sm text-gray-600"
        />
        {isClassifying && <p className="mb-2 text-xs text-gray-500">กำลังวิเคราะห์รูปภาพด้วย AI...</p>}
        {previewUrls.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto">
            {previewUrls.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt={`รูปขยะ ${index + 1}`} className="h-20 w-20 rounded-lg object-cover" />
            ))}
          </div>
        )}

        <label className="mb-1 block text-sm font-medium text-gray-700">ตำแหน่งปัจจุบัน</label>
        <p className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          📍 {initialPosition.latitude.toFixed(5)}, {initialPosition.longitude.toFixed(5)}
        </p>

        <label className="mb-1 block text-sm font-medium text-gray-700">หมายเหตุ (ถ้ามี)</label>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={2}
          placeholder="เช่น จุดสังเกต, ปริมาณขยะโดยประมาณ"
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอเรียกรถเก็บขยะ'}
        </button>
      </form>
    </div>
  );
}

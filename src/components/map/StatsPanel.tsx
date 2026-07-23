'use client';

import { useEffect, useState } from 'react';
import { WASTE_TYPE_LABELS } from '@/types';
import type { WasteReport, WasteType } from '@/types';
import { getEcoStats, getTotalKg, type EcoStats } from '@/lib/personalStats';
import { calcCo2Saved } from '@/lib/co2Calculator';

const WASTE_EMOJI: Record<WasteType, string> = {
  plastic: '🧴', paper: '📄', glass: '🍶', metal: '🔩',
  electronic: '💻', organic: '🥬', mixed: '🗑️',
};

interface Props { reports: WasteReport[]; onClose: () => void; }

function buildStats(list: WasteReport[]) {
  const completed = list.filter((r) => r.status === 'completed').length;
  const byType = list.reduce<Partial<Record<WasteType, number>>>((acc, r) => {
    acc[r.wasteType] = (acc[r.wasteType] ?? 0) + 1;
    return acc;
  }, {});
  const topType = (Object.entries(byType) as [WasteType, number][]).sort((a, b) => b[1] - a[1])[0];
  const maxCount = Math.max(...Object.values(byType), 1);
  return { completed, byType, topType, maxCount };
}

function calcTotalCo2(stats: EcoStats): number {
  return (Object.entries(stats.kgByType) as [WasteType, number][])
    .reduce((sum, [type, kg]) => sum + calcCo2Saved(type, kg), 0);
}

export default function StatsPanel({ reports, onClose }: Props) {
  const [ecoStats, setEcoStats] = useState<EcoStats | null>(null);
  useEffect(() => { setEcoStats(getEcoStats()); }, []);

  const { completed, byType, topType, maxCount } = buildStats(reports);
  const totalKg = ecoStats ? getTotalKg(ecoStats) : 0;
  const totalCo2 = ecoStats ? calcTotalCo2(ecoStats) : 0;
  const hasPersonalData = totalKg > 0;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-t-2xl bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">📊 สถิติการรีไซเคิล</h2>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">ข้อมูลรวมทั้งระบบ {reports.length} รายการ</p>
          </div>
          <button type="button" onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800">✕</button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-900/30">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{reports.length}</p>
              <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-500">ครั้งทั้งหมด</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3 text-center dark:bg-blue-900/30">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{completed}</p>
              <p className="mt-0.5 text-xs text-blue-600 dark:text-blue-500">เสร็จสมบูรณ์</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 text-center dark:bg-amber-900/30">
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {Math.round((completed / Math.max(reports.length, 1)) * 100)}%
              </p>
              <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-500">สำเร็จ</p>
            </div>
          </div>

          {topType && (
            <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">แจ้งบ่อยที่สุด</p>
              <p className="text-base font-bold text-gray-800 dark:text-gray-100">
                {WASTE_EMOJI[topType[0]]} {WASTE_TYPE_LABELS[topType[0]]}
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">{topType[1]} ครั้ง</span>
              </p>
            </div>
          )}

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">แยกตามประเภทขยะ</p>
          <ul className="mb-5 space-y-2">
            {(Object.entries(byType) as [WasteType, number][]).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <li key={type} className="flex items-center gap-3">
                <span className="w-5 text-center text-base">{WASTE_EMOJI[type]}</span>
                <span className="w-24 shrink-0 text-xs text-gray-600 dark:text-gray-300">{WASTE_TYPE_LABELS[type]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">{count}</span>
              </li>
            ))}
          </ul>

          {hasPersonalData && (
            <>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">ผลกระทบของคุณ</p>
                <div className="h-px flex-1 bg-gray-100 dark:bg-gray-700" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-teal-50 p-3 text-center dark:bg-teal-900/30">
                  <p className="text-xl font-bold text-teal-700 dark:text-teal-400">{totalKg.toFixed(1)}</p>
                  <p className="mt-0.5 text-xs text-teal-600 dark:text-teal-500">กก. ที่รีไซเคิล</p>
                </div>
                <div className="rounded-xl bg-green-50 p-3 text-center dark:bg-green-900/30">
                  <p className="text-xl font-bold text-green-700 dark:text-green-400">{totalCo2.toFixed(1)}</p>
                  <p className="mt-0.5 text-xs text-green-600 dark:text-green-500">กก. CO₂ ลดลง</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-center dark:bg-emerald-900/30">
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                    ฿{(ecoStats?.totalEarnings ?? 0).toFixed(0)}
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-500">รายได้รวม</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-4 pb-5 pt-1">
          <button type="button" onClick={onClose}
            className="w-full rounded-full border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}

import type { WasteType } from '@/types';

const KEY = 'kk_personal_eco_stats';

export interface EcoStats {
  kgByType: Partial<Record<WasteType, number>>;
  totalEarnings: number;
}

function load(): EcoStats {
  if (typeof window === 'undefined') return { kgByType: {}, totalEarnings: 0 };
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? { kgByType: {}, totalEarnings: 0 };
  } catch {
    return { kgByType: {}, totalEarnings: 0 };
  }
}

export function addEcoStat(wasteType: WasteType, weightKg: number, earning: number): void {
  if (typeof window === 'undefined') return;
  try {
    const stats = load();
    stats.kgByType[wasteType] = (stats.kgByType[wasteType] ?? 0) + weightKg;
    stats.totalEarnings += earning;
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch { /* localStorage ไม่พร้อมใช้งาน */ }
}

export function getEcoStats(): EcoStats {
  return load();
}

export function getTotalKg(stats: EcoStats): number {
  return Object.values(stats.kgByType).reduce<number>((sum, kg) => sum + (kg ?? 0), 0);
}

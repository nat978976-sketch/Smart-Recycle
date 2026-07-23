import type { WasteType } from '@/types';

// kg CO₂ saved per kg recycled vs. landfill disposal
const CO2_FACTORS: Record<WasteType, number> = {
  plastic:    1.5,
  paper:      1.1,
  glass:      0.3,
  metal:      4.0,
  electronic: 2.5,
  organic:    0.5,
  mixed:      1.0,
};

export function calcCo2Saved(wasteType: WasteType, weightKg: number): number {
  return CO2_FACTORS[wasteType] * weightKg;
}

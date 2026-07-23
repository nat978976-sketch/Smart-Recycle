import { NextResponse } from 'next/server';
import { updateRecyclingShop } from '@/lib/store/recyclingShopsStore';
import type { WasteType } from '@/types';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();

  // รับเฉพาะ pricePerKg — validate ว่าเป็น Record<WasteType, number>
  if (body.pricePerKg !== undefined && typeof body.pricePerKg !== 'object') {
    return NextResponse.json({ error: 'รูปแบบราคาไม่ถูกต้อง' }, { status: 400 });
  }

  const cleaned: Partial<Record<WasteType, number>> = {};
  if (body.pricePerKg) {
    for (const [k, v] of Object.entries(body.pricePerKg)) {
      if (typeof v === 'number' && v >= 0) cleaned[k as WasteType] = v;
    }
  }

  const updated = updateRecyclingShop(params.id, { pricePerKg: cleaned });
  if (!updated) return NextResponse.json({ error: 'ไม่พบร้านค้า' }, { status: 404 });

  return NextResponse.json(updated);
}

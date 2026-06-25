import { NextResponse } from 'next/server';
import { addRecyclingShop, getRecyclingShops } from '@/lib/store/recyclingShopsStore';
import type { RecyclingShop } from '@/types';

export async function GET() {
  return NextResponse.json(getRecyclingShops());
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name || !Array.isArray(body.acceptedWasteTypes) || body.acceptedWasteTypes.length === 0) {
    return NextResponse.json({ error: 'กรุณากรอกชื่อร้านและเลือกประเภทขยะที่รับซื้ออย่างน้อย 1 ประเภท' }, { status: 400 });
  }

  if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
    return NextResponse.json({ error: 'ไม่พบตำแหน่งร้าน กรุณาเปิดสิทธิ์เข้าถึงตำแหน่งแล้วลองใหม่' }, { status: 400 });
  }

  const shop: RecyclingShop = {
    id: crypto.randomUUID(),
    name: body.name,
    latitude: body.latitude,
    longitude: body.longitude,
    acceptedWasteTypes: body.acceptedWasteTypes,
    phone: body.phone || undefined,
    isActive: true,
  };

  addRecyclingShop(shop);
  return NextResponse.json(shop, { status: 201 });
}

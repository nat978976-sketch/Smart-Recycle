import { NextResponse } from 'next/server';
import { getRecyclingShops } from '@/lib/store/recyclingShopsStore';
import { getVisitors } from '@/lib/store/visitorsStore';

// รหัสผ่านเก็บไว้ฝั่งเซิร์ฟเวอร์เท่านั้น ไม่ถูกส่งไปอยู่ใน client bundle
const ADMIN_PASSWORD = '100954';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (body.password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  return NextResponse.json({
    shops: getRecyclingShops(),
    visitors: getVisitors(),
  });
}

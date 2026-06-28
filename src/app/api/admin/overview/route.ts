import { NextResponse } from 'next/server';
import { isValidAdminPassword } from '@/lib/adminAuth';
import { getRecyclingShops } from '@/lib/store/recyclingShopsStore';
import { getVisitors } from '@/lib/store/visitorsStore';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (!isValidAdminPassword(body.password)) {
    return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  return NextResponse.json({
    shops: getRecyclingShops(),
    visitors: getVisitors(),
  });
}

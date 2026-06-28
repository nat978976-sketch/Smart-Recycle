import { NextResponse } from 'next/server';
import { isValidAdminPassword } from '@/lib/adminAuth';
import { removeRecyclingShop } from '@/lib/store/recyclingShopsStore';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const password = request.headers.get('x-admin-password');

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
  }

  const removed = removeRecyclingShop(params.id);
  if (!removed) {
    return NextResponse.json({ error: 'ไม่พบร้านค้านี้' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

import { NextResponse } from 'next/server';
import { addVisitor } from '@/lib/store/visitorsStore';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === 'string' ? body.path : '/';

  addVisitor({
    id: crypto.randomUUID(),
    path,
    userAgent: request.headers.get('user-agent'),
    visitedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

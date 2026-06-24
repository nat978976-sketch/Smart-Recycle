import { NextResponse } from 'next/server';
import { updateWasteReport } from '@/lib/store/wasteReportsStore';
import { emitReportUpdated } from '@/lib/events/reportEvents';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const updated = updateWasteReport(params.id, body);

  if (!updated) {
    return NextResponse.json({ error: 'ไม่พบรายงานขยะนี้' }, { status: 404 });
  }

  emitReportUpdated(updated);
  return NextResponse.json(updated);
}

import { NextResponse } from 'next/server';
import { addWasteReport, getWasteReports } from '@/lib/store/wasteReportsStore';
import { emitReportCreated } from '@/lib/events/reportEvents';
import { runSimulation } from '@/lib/simulation/liveSimulator';
import type { WasteReport } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const { newReport } = runSimulation();

  const reports = getWasteReports().filter((report) => !status || report.status === status);
  const response = NextResponse.json(reports);
  if (newReport) response.headers.set('x-new-report', '1');
  return response;
}

export async function POST(request: Request) {
  const body = await request.json();

  const report: WasteReport = {
    id: crypto.randomUUID(),
    userId: body.userId ?? 'anonymous',
    wasteType: body.wasteType,
    photoUrls: body.photoUrls ?? [],
    latitude: body.latitude,
    longitude: body.longitude,
    note: body.note,
    status: 'pending',
    acceptedByShopId: null,
    createdAt: new Date().toISOString(),
  };

  addWasteReport(report);
  emitReportCreated(report);
  return NextResponse.json(report, { status: 201 });
}

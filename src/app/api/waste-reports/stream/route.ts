import { getReportEmitter } from '@/lib/events/reportEvents';
import { getWasteReports } from '@/lib/store/wasteReportsStore';
import { SEED_RECYCLING_SHOPS } from '@/lib/data/recyclingShops';
import { distanceKm } from '@/lib/geo/distance';
import type { WasteReport } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function toSseMessage(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const shopId = searchParams.get('shopId');
  const radiusKm = Number(searchParams.get('radiusKm')) || 5;

  const shop = shopId ? SEED_RECYCLING_SHOPS.find((candidate) => candidate.id === shopId) : null;

  function isRelevant(report: WasteReport) {
    if (status && report.status !== status) return false;
    if (!shop) return true;
    return shop.acceptedWasteTypes.includes(report.wasteType) && distanceKm(shop, report) <= radiusKm;
  }

  const emitter = getReportEmitter();
  const encoder = new TextEncoder();

  let onCreated: (report: WasteReport) => void;
  let onUpdated: (report: WasteReport) => void;
  let keepAlive: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(toSseMessage('init', getWasteReports().filter(isRelevant))));

      onCreated = (report) => {
        if (!isRelevant(report)) return;
        try {
          controller.enqueue(encoder.encode(toSseMessage('created', report)));
        } catch {
          // controller อาจถูกปิดไปแล้วถ้าผู้ใช้ปิดแท็บพอดีตอนมีอีเวนต์เข้ามา
        }
      };

      onUpdated = (report) => {
        try {
          controller.enqueue(encoder.encode(toSseMessage('updated', report)));
        } catch {
          // เช่นเดียวกับ onCreated
        }
      };

      emitter.on('report:created', onCreated);
      emitter.on('report:updated', onUpdated);

      // ส่ง ping เป็นระยะเพื่อกัน proxy/เบราว์เซอร์ตัดการเชื่อมต่อ SSE ที่เงียบนานเกินไป
      keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(keepAlive);
        }
      }, 25000);
    },
    cancel() {
      emitter.off('report:created', onCreated);
      emitter.off('report:updated', onUpdated);
      clearInterval(keepAlive);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

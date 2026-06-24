import { EventEmitter } from 'events';
import type { WasteReport } from '@/types';

declare global {
  // eslint-disable-next-line no-var
  var __reportEventEmitter: EventEmitter | undefined;
}

// เก็บ emitter ไว้บน global เช่นเดียวกับ wasteReportsStore เพื่อไม่ให้หาย/ซ้ำตอน Next.js dev hot-reload
export function getReportEmitter(): EventEmitter {
  if (!global.__reportEventEmitter) {
    global.__reportEventEmitter = new EventEmitter();
    global.__reportEventEmitter.setMaxListeners(0);
  }
  return global.__reportEventEmitter;
}

export function emitReportCreated(report: WasteReport): void {
  getReportEmitter().emit('report:created', report);
}

export function emitReportUpdated(report: WasteReport): void {
  getReportEmitter().emit('report:updated', report);
}

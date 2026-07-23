import type { VisitorLog } from '@/types';

const PATHS = ['/', '/', '/', '/', '/', '/', '/shop-dashboard', '/shop-register'];

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Redmi Note 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 12; OPPO A96) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; vivo V29) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 11; Xiaomi 11T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.8 Mobile/15E148 Safari/604.1',
];

function prng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generateSeedVisitors(): VisitorLog[] {
  const rand = prng(20240202);
  const visitors: VisitorLog[] = [];

  const startMs = new Date('2026-01-01T08:00:00+07:00').getTime();
  const endMs   = new Date('2026-07-22T22:00:00+07:00').getTime();

  for (let i = 0; i < 467; i++) {
    const path      = PATHS[Math.floor(rand() * PATHS.length)];
    const userAgent = USER_AGENTS[Math.floor(rand() * USER_AGENTS.length)];
    const visitedAt = new Date(startMs + rand() * (endMs - startMs)).toISOString();

    visitors.push({
      id: `seed_v_${String(i + 1).padStart(4, '0')}`,
      path,
      userAgent,
      visitedAt,
    });
  }

  return visitors.sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime());
}

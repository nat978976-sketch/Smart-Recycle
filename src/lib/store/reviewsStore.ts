import type { ShopReview } from '@/types';
import { SEED_REVIEWS } from '@/lib/data/seedReviews';

declare global {
  // eslint-disable-next-line no-var
  var __reviewsStore: ShopReview[] | undefined;
}

function initStore(): ShopReview[] {
  if (!global.__reviewsStore) {
    global.__reviewsStore = [...SEED_REVIEWS];
  }
  return global.__reviewsStore;
}

export function getReviews(shopId?: string): ShopReview[] {
  const store = initStore();
  return shopId ? store.filter((r) => r.shopId === shopId) : store;
}

export function addReview(data: Omit<ShopReview, 'id' | 'createdAt'>): ShopReview {
  const store = initStore();
  const review: ShopReview = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  store.push(review);
  return review;
}

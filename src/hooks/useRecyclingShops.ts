'use client';

import { useEffect, useState } from 'react';
import type { RecyclingShop } from '@/types';

export function useRecyclingShops() {
  const [shops, setShops] = useState<RecyclingShop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recycling-shops')
      .then((response) => (response.ok ? response.json() : []))
      .then(setShops)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { shops, isLoading };
}

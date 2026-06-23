import type { WasteClassificationResult } from '@/types';

export async function classifyWasteImage(photo: File): Promise<WasteClassificationResult> {
  const formData = new FormData();
  formData.append('photo', photo);

  const response = await fetch('/api/classify-waste', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Waste classification request failed');
  }

  return response.json();
}

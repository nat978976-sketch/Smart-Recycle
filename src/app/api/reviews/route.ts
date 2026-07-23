import { NextResponse } from 'next/server';
import { addReview, getReviews } from '@/lib/store/reviewsStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get('shopId') ?? undefined;
  return NextResponse.json(getReviews(shopId));
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.shopId || !body.comment || typeof body.rating !== 'number') {
    return NextResponse.json({ error: 'ข้อมูลไม่ครบ' }, { status: 400 });
  }
  const review = addReview({
    shopId: body.shopId,
    rating: Math.min(5, Math.max(1, Math.round(body.rating))),
    comment: body.comment,
    author: body.author || 'ไม่ระบุชื่อ',
  });
  return NextResponse.json(review, { status: 201 });
}

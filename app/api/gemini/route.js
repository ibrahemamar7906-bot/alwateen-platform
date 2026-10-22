import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST() {
  return NextResponse.json({ 
    error: { message: 'تم إيقاف خدمات الذكاء الاصطناعي بناءً على إعدادات المنصة الحالية.' } 
  }, { status: 403 });
}
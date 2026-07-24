import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { creatorEmail, title, description, price, qrCodeUrl, deliveryType, deliveryContent } = body;

    if (!creatorEmail || !title || !price || !qrCodeUrl || !deliveryContent) {
      return NextResponse.json({ error: '请填写完整的必填项信息（邮箱、标题、价格、收款码及交付内容）' }, { status: 400 });
    }

    const product = db.createProduct({
      creatorEmail,
      title,
      description: description || '',
      price: Number(price),
      qrCodeUrl,
      deliveryType: deliveryType || 'netdisk',
      deliveryContent,
    });

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '创建产品失败' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = db.getProductById(id);
    if (!product) {
      return NextResponse.json({ error: '未找到该产品或已被下架' }, { status: 404 });
    }

    // Hide manageToken & creatorEmail from public API
    const publicProduct = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      qrCodeUrl: product.qrCodeUrl,
      deliveryType: product.deliveryType,
      createdAt: product.createdAt,
    };

    return NextResponse.json({ product: publicProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '获取产品失败' }, { status: 500 });
  }
}

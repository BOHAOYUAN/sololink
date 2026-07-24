import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = db.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: '未找到订单' }, { status: 404 });
    }

    const product = db.getProductById(order.productId);
    if (!product) {
      return NextResponse.json({ error: '产品信息不存在' }, { status: 404 });
    }

    // Only attach delivery content if status is verified
    let deliveryContent = undefined;
    if (order.status === 'verified') {
      deliveryContent = product.deliveryContent;
    }

    return NextResponse.json({
      order: {
        id: order.id,
        productId: order.productId,
        status: order.status,
        buyerNote: order.buyerNote,
        createdAt: order.createdAt,
        verifiedAt: order.verifiedAt,
      },
      productTitle: product.title,
      deliveryType: product.deliveryType,
      deliveryContent,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '获取订单状态失败' }, { status: 500 });
  }
}

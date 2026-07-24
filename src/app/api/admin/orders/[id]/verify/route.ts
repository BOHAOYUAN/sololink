import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { manageToken, action } = body;

    if (!manageToken) {
      return NextResponse.json({ error: '权限不足' }, { status: 401 });
    }

    const order = await db.getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }

    const product = await db.getProductByManageToken(manageToken);
    if (!product || product.id !== order.productId) {
      return NextResponse.json({ error: '您无权操作此订单' }, { status: 403 });
    }

    const updatedStatus = action === 'reject' ? 'rejected' : 'verified';
    const updatedOrder = await db.verifyOrder(id, updatedStatus);

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '核销操作失败' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const manageToken = searchParams.get('token');

    if (!manageToken) {
      return NextResponse.json({ error: '缺少管理 Token' }, { status: 401 });
    }

    const product = await db.getProductByManageToken(manageToken);
    if (!product) {
      return NextResponse.json({ error: '无效的管理 Token' }, { status: 403 });
    }

    const orders = await db.getOrdersByProductId(product.id);

    return NextResponse.json({ product, orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '获取管理数据失败' }, { status: 500 });
  }
}

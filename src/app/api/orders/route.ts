import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, buyerNote, paymentProofUrl } = body;

    if (!productId || (!buyerNote && !paymentProofUrl)) {
      return NextResponse.json({ error: '请填写交易单号或上传凭证截图' }, { status: 400 });
    }

    const product = await db.getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: '产品不存在' }, { status: 404 });
    }

    const order = await db.createOrder({
      productId,
      buyerNote: buyerNote || '扫码支付凭证',
      paymentProofUrl,
    });

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '提交订单失败' }, { status: 500 });
  }
}

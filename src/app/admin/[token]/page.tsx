'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  qrCodeUrl: string;
  deliveryContent: string;
}

interface Order {
  id: string;
  productId: string;
  buyerNote: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
}

export default function CreatorAdminPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: manageToken } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [manageToken]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?token=${manageToken}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '获取数据失败');
      setProduct(data.product);
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (orderId: string, action: 'verify' | 'reject') => {
    setProcessingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manageToken,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '操作失败');

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: action === 'reject' ? 'rejected' : 'verified' } : o))
      );
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
        <div className="text-slate-400 text-sm">正在加载创作者订单中心...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="text-amber-500 text-2xl">🔒</div>
          <h2 className="text-lg font-bold text-slate-100">无法访问订单管理后台</h2>
          <p className="text-xs text-slate-400">{error || '请检查您的管理 Token 是否正确'}</p>
          <Link href="/" className="inline-block px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-lg">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const verifiedOrders = orders.filter((o) => o.status === 'verified');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Mobile Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">SoloLink 管理后台</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              移动优先
            </span>
          </div>
          <button
            onClick={fetchOrders}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
          >
            🔄 刷新订单
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Product Overview Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="text-xs text-slate-400">正在管理的数字产品：</div>
          <h1 className="text-lg font-bold text-slate-100">{product.title}</h1>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">单价</span>
              <span className="text-sm font-bold text-amber-400 font-mono">￥{product.price}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">待核销</span>
              <span className="text-sm font-bold text-amber-500 font-mono">{pendingOrders.length}</span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">已完成</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">{verifiedOrders.length}</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/p/${product.id}`}
              target="_blank"
              className="text-xs text-amber-400 hover:underline flex items-center justify-between"
            >
              <span>🔗 前往买家付费落地页</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* PENDING ORDERS */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span>待核销订单</span>
              {pendingOrders.length > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400">
                  {pendingOrders.length}
                </span>
              )}
            </h2>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-6 text-center text-xs text-slate-500">
              🎉 暂无待核销订单，分享付费链接吸引第一批创作者买家吧！
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px]">{order.id}</span>
                    <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">买家付款单号/备注：</span>
                    <span className="text-sm font-mono text-amber-300 font-bold break-all">
                      {order.buyerNote}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleVerify(order.id, 'verify')}
                      disabled={processingId === order.id}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition"
                    >
                      {processingId === order.id ? '核销中...' : '✅ 确认收款，一键解锁'}
                    </button>
                    <button
                      onClick={() => handleVerify(order.id, 'reject')}
                      disabled={processingId === order.id}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-medium rounded-lg transition"
                    >
                      拒绝/假单
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* VERIFIED ORDERS HISTORY */}
        <section className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-slate-400">已核销成交历史 ({verifiedOrders.length})</h2>

          {verifiedOrders.length === 0 ? (
            <div className="bg-slate-900/30 border border-slate-800/40 rounded-xl p-4 text-center text-xs text-slate-600">
              尚无成交记录
            </div>
          ) : (
            <div className="space-y-2">
              {verifiedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono text-slate-300 block">{order.buyerNote}</span>
                    <span className="text-[10px] text-slate-500">
                      成交于 {new Date(order.verifiedAt || order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/20">
                    已交付 ￥{product.price}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

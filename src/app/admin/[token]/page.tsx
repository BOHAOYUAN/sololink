'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  qrCodeUrl: string;
  deliveryContent: string;
  description?: string;
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

  // Free Feature: Xiaohongshu Poster Modal
  const [showPosterModal, setShowPosterModal] = useState(false);

  // Pro Subscription Modal & Features
  const [showProModal, setShowProModal] = useState(false);
  const [isPro, setIsPro] = useState(false); // Can be toggled for demo or upgraded

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

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: action === 'reject' ? 'rejected' : 'verified' } : o))
      );
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setProcessingId(null);
    }
  };

  // CSV Export (Pro Feature)
  const handleExportCSV = () => {
    if (!orders.length) {
      alert('尚无数据可导出');
      return;
    }
    const headers = ['订单ID', '产品名称', '买家单号/备注', '状态', '创建时间', '核销时间'];
    const rows = orders.map((o) => [
      o.id,
      product?.title || '',
      `"${o.buyerNote.replace(/"/g, '""')}"`,
      o.status === 'verified' ? '已核销' : o.status === 'rejected' ? '已拒绝' : '待核销',
      new Date(o.createdAt).toLocaleString(),
      o.verifiedAt ? new Date(o.verifiedAt).toLocaleString() : '-',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SoloLink_Orders_${product?.id || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">SoloLink 管理后台</span>
            {isPro ? (
              <span className="text-[10px] px-2 py-0.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow">
                👑 PRO 会员
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                免费版
              </span>
            )}
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
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">正在管理的数字产品：</div>
            <button
              onClick={() => setShowPosterModal(true)}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition font-medium flex items-center gap-1"
            >
              📱 一键生成小红书图文海报
            </button>
          </div>

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

          <div className="pt-2 flex items-center justify-between">
            <Link
              href={`/p/${product.id}`}
              target="_blank"
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>🔗 预览买家付费落地页</span>
              <span>→</span>
            </Link>
          </div>
        </section>

        {/* PRO SUBSCRIPTION BANNER */}
        <section className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">👑</span>
              <h2 className="text-sm font-bold text-amber-300">SoloLink Pro 专业订阅</h2>
            </div>
            <span className="text-xs text-amber-400 font-mono font-semibold">￥199 / 年</span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            解锁自动发货回调、买家数据 CSV 导出、无水印自定义品牌及微信/邮件新订单提醒。
          </p>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => setShowProModal(true)}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow"
            >
              {isPro ? '已激活 Pro (管理专业功能)' : '🚀 立即升级 Pro 专业版 (￥199/年)'}
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
              title="导出买家数据"
            >
              📊 导出买家 CSV
            </button>
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
              🎉 暂无待核销订单，分享小红书图文海报或付费链接吸引第一批创作者买家吧！
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

      {/* FREE FEATURE MODAL: XIAOHONGSHU POSTER CARD */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-sm w-full p-6 space-y-4 relative animate-fade-in shadow-2xl">
            <button
              onClick={() => setShowPosterModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-sm"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
                小红书爆款图文卡片 (免费生成)
              </span>
              <h3 className="text-base font-bold text-slate-100">宣传宣发卡片</h3>
            </div>

            {/* Poster Render Container (3:4 Xiaohongshu Ratio Style) */}
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-xl p-5 space-y-4 shadow-inner text-center">
              <div className="inline-block px-2.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full tracking-wider uppercase">
                小红书爆款推荐
              </div>

              <h4 className="text-lg font-bold text-slate-100 leading-snug">{product.title}</h4>

              {product.description && (
                <p className="text-xs text-slate-400 line-clamp-2 px-2">{product.description}</p>
              )}

              <div className="py-1">
                <span className="text-2xl font-extrabold text-amber-400 font-mono">￥{product.price}</span>
              </div>

              {/* QR Code */}
              <div className="bg-white p-2.5 rounded-xl w-32 h-32 mx-auto border border-slate-200">
                <img src={product.qrCodeUrl} alt="扫码下单" className="w-full h-full object-contain" />
              </div>

              <div className="text-[11px] text-slate-400 space-y-0.5">
                <p className="font-semibold text-slate-200">微信/支付宝扫码付 · 自动解锁网盘密码</p>
                <p className="text-[10px] text-amber-400/80">SoloLink 创作者付 · 微信防拦截保障</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              💡 提示：在手机上截图此卡片，直接发布到小红书或微信朋友圈即可开展营销！
            </p>

            <button
              onClick={() => setShowPosterModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl"
            >
              关闭预览
            </button>
          </div>
        </div>
      )}

      {/* PRO SUBSCRIPTION MODAL */}
      {showProModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 space-y-5 relative shadow-2xl">
            <button
              onClick={() => setShowProModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-sm"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">
                👑 SoloLink Pro 订阅专区
              </span>
              <h3 className="text-lg font-bold text-slate-100 pt-1">解锁完整自动化商业收益</h3>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 font-bold">⚡ 自动回调发货：</span>
                <span>集成 PayJS / 虎皮椒等 Webhook 插件，买家扫码支付后瞬间自动解密（无需人工手动点击核销）。</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 font-bold">📊 客户 CRM 导出：</span>
                <span>支持一键导出买家单号、微信、邮箱完整数据为 CSV 表格。</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 font-bold">🔔 即时订单提醒：</span>
                <span>买家提交订单时，自动触发邮件到您的邮箱，或微信 Server 酱实时推送。</span>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <span className="text-amber-400 font-bold">🛡️ 隐藏底层水印：</span>
                <span>隐藏落地页底部的 Powered 品牌标识，保持 100% 独立品牌呈现。</span>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center space-y-1">
              <div className="text-xs text-slate-300">限时早鸟订阅优惠：</div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">￥199 <span className="text-xs font-normal text-slate-400">/ 年 (相当于每日仅 0.5 元)</span></div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsPro(true);
                  alert('🎉 恭喜！已成功模拟激活 SoloLink Pro 会员权限！全套高级功能已开启。');
                  setShowProModal(false);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg"
              >
                {isPro ? '已成功开通 Pro 会员' : '💳 体验开通 Pro 会员 (￥199/年)'}
              </button>
              <button
                onClick={() => setShowProModal(false)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200"
              >
                暂时保持免费版
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

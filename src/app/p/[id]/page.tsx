'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface ProductPublic {
  id: string;
  title: string;
  description: string;
  price: number;
  qrCodeUrl: string;
  deliveryType: string;
  createdAt: string;
}

interface OrderStatus {
  id: string;
  status: 'pending' | 'verified' | 'rejected';
  buyerNote: string;
  createdAt: string;
}

export default function BuyerLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = use(params);

  const [product, setProduct] = useState<ProductPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Order state
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [deliveryContent, setDeliveryContent] = useState<string | null>(null);

  // Buyer Submission Form
  const [buyerNote, setBuyerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load product & cached order token
  useEffect(() => {
    fetchProduct();
    // Check if buyer has an active order for this product in LocalStorage
    const savedOrderId = localStorage.getItem(`sololink_order_${productId}`);
    if (savedOrderId) {
      setActiveOrderId(savedOrderId);
      checkOrderStatus(savedOrderId);
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '无法加载产品信息');
      setProduct(data.product);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkOrderStatus = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrderStatus(data.order);
        if (data.deliveryContent) {
          setDeliveryContent(data.deliveryContent);
        }
      }
    } catch (err) {
      console.error('Failed to check order:', err);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerNote.trim()) {
      showToast('请输入付款备注或微信/支付宝交易单号');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          buyerNote: buyerNote.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失败');

      // Save order to LocalStorage for persistence
      const newOrder = data.order;
      localStorage.setItem(`sololink_order_${productId}`, newOrder.id);
      setActiveOrderId(newOrder.id);
      setOrderStatus(newOrder);
      showToast('付款凭证提交成功！创作者核销后将自动呈现解密内容');
    } catch (err: any) {
      showToast(err.message || '提交订单失败');
    } finally {
      setSubmitting(false);
    }
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Anti-red / Anti-block Copy Helper
  const handleCopyAntiRed = () => {
    if (!deliveryContent) return;
    navigator.clipboard.writeText(deliveryContent);
    showToast('✅ 内容与提取码已复制到剪贴板！请关闭本页面，打开【百度网盘/夸克APP】或浏览器粘贴打开。');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-400 text-sm">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          正在安全加载交付页面...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto text-xl">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-slate-100">产品不存在或已失效</h2>
          <p className="text-xs text-slate-400">{error || '请联系创作者获取最新付费链接'}</p>
          <Link href="/" className="inline-block px-4 py-2 bg-slate-800 text-xs text-slate-300 rounded-lg hover:bg-slate-700">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = orderStatus?.status === 'verified';
  const isPending = orderStatus?.status === 'pending';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto bg-slate-900/95 border border-amber-500/40 text-amber-300 px-4 py-3 rounded-xl text-xs sm:text-sm shadow-2xl backdrop-blur flex items-center gap-2 animate-bounce">
          <span>📢</span>
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
        {/* Product Info Card */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-start justify-between gap-3">
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              数字交付产品
            </span>
            <span className="text-xs text-slate-400">创作者验证交付</span>
          </div>

          <h1 className="text-xl font-bold text-slate-100 leading-snug">{product.title}</h1>
          {product.description && (
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              {product.description}
            </p>
          )}

          <div className="pt-2 flex items-baseline justify-between border-t border-slate-800/80">
            <span className="text-xs text-slate-400">解锁全套内容</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-amber-400">￥</span>
              <span className="text-3xl font-extrabold text-amber-400 font-mono">{product.price}</span>
            </div>
          </div>
        </section>

        {/* UNLOCKED STATE */}
        {isVerified && deliveryContent && (
          <section className="bg-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl space-y-4 bg-gradient-to-b from-slate-900 to-emerald-950/20 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
              <span className="text-xl">🎉</span> 交易已核销，内容已完美解锁！
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[11px] text-slate-400 block font-medium">解密的交付内容及网盘提取码：</span>
              <div className="text-sm font-mono text-amber-300 break-all whitespace-pre-wrap leading-relaxed select-all">
                {deliveryContent}
              </div>
            </div>

            {/* Anti-Red Copy Button */}
            <button
              onClick={handleCopyAntiRed}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>📋</span> 一键复制网盘链接与提取码 (防封中转)
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              💡 提示：微信内置浏览器限制了直接跳转，点击上面按钮复制后，打开手机浏览器或网盘 App 即可查看！
            </p>
          </section>
        )}

        {/* PENDING VERIFICATION STATE */}
        {isPending && !isVerified && (
          <section className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl">
              ⏳
            </div>
            <h3 className="text-base font-bold text-slate-100">已成功提交付款凭证</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              创作者正在核对您的交易单号。核销完成后，刷新本页面或重新从微信打开即可自动显示解密链接。
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              单号备注：{orderStatus.buyerNote}
            </div>
            <button
              onClick={() => checkOrderStatus(activeOrderId!)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition"
            >
              🔄 刷新订单核销状态
            </button>
          </section>
        )}

        {/* PAYMENT & ORDER FORM STATE */}
        {!isVerified && !isPending && (
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-slate-100">第一步：扫码支付 ￥{product.price}</h2>
              <p className="text-xs text-slate-400">使用微信或支付宝扫描下方二维码付款</p>
            </div>

            {/* QR Code display */}
            <div className="bg-white p-4 rounded-xl max-w-[220px] mx-auto shadow-inner border border-slate-200 flex items-center justify-center">
              <img
                src={product.qrCodeUrl}
                alt="创作者收款码"
                className="w-full h-auto object-contain max-h-[220px]"
              />
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h3 className="text-xs font-semibold text-slate-200 text-center">
                第二步：输入付款单号或微信备注以申请解锁
              </h3>

              <form onSubmit={handleOrderSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="请输入微信/支付宝单号后4位或付款人昵称"
                    value={buyerNote}
                    onChange={(e) => setBuyerNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-amber-500/10 disabled:opacity-50"
                >
                  {submitting ? '提交中...' : `✅ 我已完成支付 (￥${product.price})，提交验证`}
                </button>
              </form>
            </div>
          </section>
        )}
      </main>

      {/* NON-BLOCKING VIRAL BADGE */}
      <div className="fixed bottom-3 left-0 right-0 z-40 px-4 pointer-events-none">
        <div className="max-w-md mx-auto flex justify-center">
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] text-slate-300 shadow-2xl backdrop-blur hover:border-amber-500/50 hover:text-amber-400 transition"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>用 SoloLink 创建你的付费链接 · 1分钟开张</span>
            <span className="text-amber-400">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

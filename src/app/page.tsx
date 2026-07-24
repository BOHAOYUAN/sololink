'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [creatorEmail, setCreatorEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('19.9');
  const [deliveryType, setDeliveryType] = useState<'netdisk' | 'code' | 'file' | 'contact'>('netdisk');
  const [deliveryContent, setDeliveryContent] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [createdProduct, setCreatedProduct] = useState<{ id: string; manageToken: string } | null>(null);
  const [error, setError] = useState('');

  // Demo fill helper
  const handleQuickDemo = () => {
    setCreatorEmail('demo@sololink.cn');
    setTitle('小红书爆款图文SOP+ Notion工作流模板 (2026版)');
    setDescription('包含15个对标账号拆解、高转化脚本公式与卡片模版，买到即送到网盘。');
    setPrice('19.9');
    setDeliveryType('netdisk');
    setDeliveryContent('链接: https://pan.baidu.com/s/1demoLinkExample123 提取码: 8888');
    // Default placeholder SVG QR Code
    setQrCodeUrl('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23ffffff"/><rect x="20" y="20" width="60" height="60" fill="%230f172a"/><rect x="30" y="30" width="40" height="40" fill="%23ffffff"/><rect x="40" y="40" width="20" height="20" fill="%230f172a"/><rect x="120" y="20" width="60" height="60" fill="%230f172a"/><rect x="130" y="30" width="40" height="40" fill="%23ffffff"/><rect x="140" y="40" width="20" height="20" fill="%230f172a"/><rect x="20" y="120" width="60" height="60" fill="%230f172a"/><rect x="30" y="130" width="40" height="40" fill="%23ffffff"/><rect x="40" y="140" width="20" height="20" fill="%230f172a"/><rect x="100" y="100" width="30" height="30" fill="%23d97706"/><rect x="140" y="140" width="40" height="40" fill="%230f172a"/><text x="100" y="190" font-size="12" text-anchor="middle" fill="%2364748b">微信/支付宝演示收款码</text></svg>');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodeUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!creatorEmail || !title || !price || !qrCodeUrl || !deliveryContent) {
      setError('请完整填写必填项（邮箱、标题、价格、收款码及交付内容）');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorEmail,
          title,
          description,
          price,
          qrCodeUrl,
          deliveryType,
          deliveryContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '创建失败');

      setCreatedProduct({
        id: data.product.id,
        manageToken: data.product.manageToken,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-lg">
              S
            </div>
            <span className="font-semibold text-lg tracking-tight">SoloLink <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">创作者付</span></span>
          </div>
          <span className="text-xs text-slate-400">零门槛 · 1分钟数字产品自动交付</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-10">
        {/* Hero Banner */}
        <section className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-amber-400">
            <span>✨ 一人公司 MVP 最优解</span>
            <span className="text-slate-600">|</span>
            <span>无商户号也可秒开张</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-amber-400 bg-clip-text text-transparent">
            把你的网盘资料、电子书与代码<br />变成自动收款的付费链接
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            贴上个人收款码即可开启变现，自动解决微信防红、买家查单与凭证交付。零扣费、无复杂审核。
          </p>
        </section>

        {/* Form or Result Card */}
        {createdProduct ? (
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-emerald-400 font-semibold text-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              恭喜！您的变现链接已生成！
            </div>

            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs text-slate-400 block mb-1">🔗 买家付费落地页链接 (发给小红书/微信客户)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/p/${createdProduct.id}`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-mono"
                  />
                  <Link
                    href={`/p/${createdProduct.id}`}
                    target="_blank"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium rounded-lg text-sm transition"
                  >
                    预览落地页
                  </Link>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">🔑 创作者订单核销后台 (建议收藏该链接)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/admin/${createdProduct.manageToken}`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono"
                  />
                  <Link
                    href={`/admin/${createdProduct.manageToken}`}
                    target="_blank"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-sm transition"
                  >
                    前往管理订单
                  </Link>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCreatedProduct(null)}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              ← 再建一个新数字产品
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>1分钟创建你的第一款数字产品</span>
              </h2>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition font-medium"
              >
                ⚡ 填入演示样例数据
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Title */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  数字产品名称 <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例：独立开发者变现指南.pdf / 小红书爆款图文SOP"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition"
                  required
                />
              </div>

              {/* Price & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    售价 (元) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 text-sm">￥</span>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="19.9"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    创作者接收通知邮箱 <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={creatorEmail}
                    onChange={(e) => setCreatorEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  产品介绍 / 卖点描述
                </label>
                <textarea
                  rows={2}
                  placeholder="介绍你的资料包含什么、能帮买家解决什么痛点..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* QR Code Upload */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  上传你的个人微信/支付宝收款码 <span className="text-amber-500">*</span>
                </label>
                <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="收款码预览" className="w-16 h-16 object-contain rounded-lg border border-slate-700 bg-white" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-500">
                      待上传
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">支持微信赞赏码、微信个人收款码或支付宝二维码</p>
                  </div>
                </div>
              </div>

              {/* Delivery Content */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  买家付款并核销后解密的交付内容 <span className="text-amber-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="如：网盘链接: https://pan.baidu.com/s/xxx 提取码: 8888 或 序列号兑换码"
                  value={deliveryContent}
                  onChange={(e) => setDeliveryContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition font-mono"
                  required
                />
                <p className="text-[11px] text-amber-500/80 mt-1">
                  🛡️ 系统已内置“微信防红防拦截”中转机制，买家可一键复制并无障碍跳转打开网盘。
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-base transition shadow-lg shadow-amber-500/10 disabled:opacity-50"
              >
                {loading ? '正在生成付费落地页...' : '🚀 免费生成付费变现链接'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>SoloLink · 专为中国创作者与独立开发者设计的极简数字交付工具</p>
      </footer>
    </div>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Search, ArrowRight, Layers, BellRing, ClipboardCheck } from 'lucide-react';
import useFetch from '../utils/useFetch';
import { ProductGrid } from '../components/shop';
import { Skeleton } from '../components/ui';

export default function Home() {
  const nav = useNavigate(), [q, setQ] = useState('');
  const cats = useFetch('/products/categories'), feat = useFetch('/products', { limit: 4, sort: 'newest' });
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
        <div>
          <h1 className="text-4xl font-bold leading-[1.05] sm:text-6xl">Stock your shelves in bulk, and always know what to reorder next.</h1>
          <p className="mt-5 max-w-xl text-lg text-navy-600">StockPulse connects retailers with wholesale suppliers. Compare bulk price breaks, order by the case, and see live stock levels before you commit.</p>
          <form className="mt-8 flex max-w-xl gap-2" onSubmit={(e) => { e.preventDefault(); nav(`/products?q=${encodeURIComponent(q)}`); }}>
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><input aria-label="Search products" className="input pl-9" placeholder="Search coffee, packaging, stationery…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <button className="btn-accent">Search</button></form>
          <Link to="/products" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-em-700 hover:underline">Browse the full catalogue <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-bold">Bulk pricing, made visible</h2>
          <p className="mt-1 text-sm text-navy-600">Every product shows its price breaks, so the cost of ordering more is clear up front.</p>
          <table className="mt-4 w-full text-sm"><tbody>{[['6–23 cases', '$18.50', ''], ['24–59 cases', '$16.90', 'Save 9%'], ['60+ cases', '$15.40', 'Save 17%']].map(([a, b, c]) => <tr key={a} className="border-t border-line"><td className="py-2.5">{a}</td><td className="py-2.5 font-bold">{b}</td><td className="py-2.5 text-right font-semibold text-em-700">{c}</td></tr>)}</tbody></table>
          <p className="mt-3 text-xs text-navy-600">Example: Single-Origin Arabica Beans 1kg</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">Shop by category</h2>
        <div className="mt-5 flex flex-wrap gap-2">{cats.loading ? [...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-32" />) : (cats.data || []).map((c) => <Link key={c.name} to={`/products?category=${encodeURIComponent(c.name)}`} className="btn-ghost">{c.name}<span className="text-navy-400">{c.count}</span></Link>)}</div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex items-end justify-between"><h2 className="text-2xl font-bold">New to the catalogue</h2><Link to="/products" className="text-sm font-semibold text-em-700 hover:underline">View all</Link></div>
        {feat.loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72" />)}</div> : feat.error ? <p className="text-danger">{feat.error}</p> : <ProductGrid products={feat.data} />}
      </section>

      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6">
        <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
          {[[Layers, 'Buy more, pay less', 'Tiered pricing applies automatically as your quantity grows. The server always recalculates the final price.'], [BellRing, 'Smart stock alerts', 'Each product has an alert threshold and a target level. When stock runs low, StockPulse tells you how many units to reorder and why.'], [ClipboardCheck, 'Orders you can trust', 'Stock is reserved the moment an order is placed, so what you see is what is actually available.']].map(([I, t, d]) => (
            <div key={t} className="bg-card p-6"><I className="h-6 w-6 text-em-600" /><h3 className="mt-3 text-lg font-bold">{t}</h3><p className="mt-1 text-sm text-navy-600">{d}</p></div>))}
        </div>
      </section>
    </>);
}

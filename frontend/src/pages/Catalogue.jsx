import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import useFetch from '../utils/useFetch';
import { ProductGrid } from '../components/shop';
import { Skeleton, Empty, ErrorState } from '../components/ui';

export default function Catalogue() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') || '', category = sp.get('category') || '', sort = sp.get('sort') || 'name_asc', page = Number(sp.get('page')) || 1;
  const [text, setText] = useState(q);
  useEffect(() => setText(q), [q]);
  useEffect(() => { const t = setTimeout(() => text !== q && update({ q: text, page: '' }), 350); return () => clearTimeout(t); }, [text]); // debounce search
  const update = (patch) => { const n = new URLSearchParams(sp); Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k))); setSp(n); };
  const cats = useFetch('/products/categories'), { data, meta, loading, error, reload } = useFetch('/products', { q, category, sort, page, limit: 12 });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Wholesale catalogue</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_200px_200px]">
        <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><input aria-label="Search by name" className="input pl-9" placeholder="Search by product name or SKU" value={text} onChange={(e) => setText(e.target.value)} /></div>
        <select aria-label="Category" className="input" value={category} onChange={(e) => update({ category: e.target.value, page: '' })}><option value="">All categories</option>{(cats.data || []).map((c) => <option key={c.name}>{c.name}</option>)}</select>
        <select aria-label="Sort" className="input" value={sort} onChange={(e) => update({ sort: e.target.value, page: '' })}><option value="name_asc">Name, A to Z</option><option value="name_desc">Name, Z to A</option><option value="price_asc">Price, low to high</option><option value="price_desc">Price, high to low</option></select>
      </div>
      <div className="mt-8">
        {loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
          : error ? <ErrorState message={error} onRetry={reload} />
          : !data.length ? <Empty title="No products match your search" hint="Try a different name or clear the category filter." action={<button className="btn-ghost" onClick={() => { setText(''); setSp({}); }}>Clear filters</button>} />
          : <><p className="mb-4 text-sm text-navy-600">{meta.total} products</p><ProductGrid products={data} />
            {meta.pages > 1 && <div className="mt-10 flex items-center justify-center gap-3"><button className="btn-ghost" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>Previous</button><span className="text-sm">Page {meta.page} of {meta.pages}</span><button className="btn-ghost" disabled={page >= meta.pages} onClick={() => update({ page: String(page + 1) })}>Next</button></div>}</>}
      </div>
    </div>);
}

import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, ChevronLeft } from 'lucide-react';
import useFetch from '../utils/useFetch';
import { useCart } from '../context/CartContext'; import { useAuth } from '../context/AuthContext'; import { useToast } from '../context/ToastContext';
import { BulkTable } from '../components/shop';
import { ProductImage, QuantityInput, StockBadge, Skeleton, ErrorState } from '../components/ui';
import { money, unitPrice } from '../utils/format';

export default function ProductDetail() {
  const { slug } = useParams(), { data: p, loading, error, reload } = useFetch(`/products/${slug}`);
  const { add } = useCart(), { isAdmin } = useAuth(), toast = useToast(), nav = useNavigate();
  const [qty, setQty] = useState(null), [img, setImg] = useState(0);
  if (loading) return <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2"><Skeleton className="aspect-[4/3]" /><Skeleton className="h-96" /></div>;
  if (error) return <div className="mx-auto max-w-xl px-4 py-16"><ErrorState message={error} onRetry={reload} /></div>;
  const q = qty ?? p.minOrderQty, out = p.stockQuantity <= 0, unit = unitPrice(p, q);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link to="/products" className="mb-6 inline-flex items-center gap-1 text-sm font-semibold text-navy-600 hover:text-navy-950"><ChevronLeft className="h-4 w-4" />Back to catalogue</Link>
      <div className="grid gap-10 md:grid-cols-2">
        <div><ProductImage src={p.images[img]} alt={p.name} className="aspect-[4/3] w-full rounded-lg border border-line" />
          {p.images.length > 1 && <div className="mt-3 flex gap-2">{p.images.map((s, i) => <button key={i} aria-label={`Image ${i + 1}`} onClick={() => setImg(i)} className={`overflow-hidden rounded-md border-2 ${i === img ? 'border-em-600' : 'border-transparent'}`}><ProductImage src={s} alt="" className="h-16 w-20" /></button>)}</div>}</div>
        <div>
          <span className="text-sm font-semibold text-em-700">{p.category}</span>
          <h1 className="mt-1 text-3xl font-bold">{p.name}</h1>
          <p className="mt-1 text-sm text-navy-600">SKU {p.sku}</p>
          <div className="mt-4 flex items-center gap-3"><StockBadge status={p.stockStatus} /><span className="text-sm text-navy-600">{out ? 'Currently unavailable' : `${p.stockQuantity} units available`}</span></div>
          <p className="mt-5 text-navy-600">{p.description}</p>
          <div className="card mt-6 p-5">
            <div className="flex items-baseline gap-2"><span className="font-display text-3xl font-bold">{money(unit)}</span><span className="text-sm text-navy-600">per unit at {q} units</span></div>
            <p className="mt-1 text-sm text-navy-600">Minimum order {p.minOrderQty} units</p>
            {p.bulkTiers.length > 0 && <div className="mt-4"><BulkTable product={p} qty={q} /></div>}
            {!out && !isAdmin && <div className="mt-5 flex flex-wrap items-center gap-3"><QuantityInput value={q} min={p.minOrderQty} max={p.stockQuantity} onChange={setQty} />
              <button className="btn-accent flex-1" onClick={() => { add(p, q); toast(`${q} × ${p.name} added to cart`); }}><ShoppingCart className="h-4 w-4" />Add to cart · {money(unit * q)}</button></div>}
            {isAdmin && <p className="mt-4 text-sm text-navy-600">Admin accounts cannot place orders.</p>}
            {out && <p className="mt-4 text-sm font-semibold text-danger">This product is out of stock. Check back soon.</p>}
          </div>
        </div>
      </div>
    </div>);
}

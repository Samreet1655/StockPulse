import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext'; import { useAuth } from '../context/AuthContext';
import { ProductImage, QuantityInput, Empty } from '../components/ui';
import { OrderSummary } from '../components/shop';
import { money } from '../utils/format';

export default function Cart() {
  const { lines, total, setQty, remove } = useCart(), { user, isAdmin } = useAuth(), nav = useNavigate();
  if (!lines.length) return <div className="mx-auto max-w-2xl px-4 py-16"><Empty title="Your cart is empty" hint="Browse the catalogue and add products to start a wholesale order." action={<Link to="/products" className="btn-primary"><ShoppingBag className="h-4 w-4" />Browse products</Link>} /></div>;
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Your cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-3">{lines.map((l) => (
          <li key={l._id} className="card flex gap-4 p-4">
            <ProductImage src={l.image} alt={l.name} className="h-24 w-24 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <Link to={`/products/${l.slug}`} className="font-bold hover:text-em-700">{l.name}</Link>
              <p className="text-xs text-navy-600">{l.sku} · Min. {l.minOrderQty} · {l.stockQuantity} in stock</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><QuantityInput value={l.quantity} min={l.minOrderQty} max={l.stockQuantity} onChange={(v) => setQty(l._id, v)} />
                <div className="text-right"><div className="font-bold">{money(l.line)}</div><div className="text-xs text-navy-600">{money(l.unit)} each</div></div></div>
            </div>
            <button aria-label={`Remove ${l.name}`} onClick={() => remove(l._id)} className="self-start rounded p-2 text-navy-400 hover:bg-paper hover:text-danger"><Trash2 className="h-4 w-4" /></button>
          </li>))}</ul>
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start"><OrderSummary lines={lines} total={total} />
          {isAdmin ? <p className="text-sm text-navy-600">Admin accounts cannot place orders.</p>
            : <button className="btn-accent w-full py-3" onClick={() => nav(user ? '/checkout' : '/login', { state: { from: '/checkout' } })}>{user ? 'Proceed to checkout' : 'Log in to check out'}</button>}</div>
      </div>
    </div>);
}

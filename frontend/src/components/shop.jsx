import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Menu, X, Activity, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductImage, StockBadge } from './ui';
import { money } from '../utils/format';

export const Logo = ({ dark }) => <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-md bg-em-600 text-white"><Activity className="h-4 w-4" /></span><span className={dark ? 'text-white' : ''}>StockPulse</span></Link>;

export function Navbar() {
  const { user, logout, isAdmin } = useAuth(), { count } = useCart(), nav = useNavigate(), [open, setOpen] = useState(false);
  const link = ({ isActive }) => `rounded px-3 py-2 text-sm font-semibold ${isActive ? 'text-em-700' : 'text-navy-600 hover:text-navy-950'}`;
  const out = () => { logout(); setOpen(false); nav('/'); };
  const items = (
    <>
      <NavLink to="/products" className={link} onClick={() => setOpen(false)}>Catalogue</NavLink>
      {user && !isAdmin && <NavLink to="/account/orders" className={link} onClick={() => setOpen(false)}>My orders</NavLink>}
      {isAdmin && <NavLink to="/admin" className={link} onClick={() => setOpen(false)}>Admin dashboard</NavLink>}
    </>);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6"><Logo /><nav className="hidden items-center md:flex">{items}</nav></div>
        <div className="flex items-center gap-2">
          {!isAdmin && <Link to="/cart" aria-label={`Cart, ${count} units`} className="relative rounded-md p-2 hover:bg-card"><ShoppingCart className="h-5 w-5" />{count > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-em-600 px-1 text-center text-[11px] font-bold leading-5 text-white">{count}</span>}</Link>}
          <div className="hidden items-center gap-2 md:flex">
            {user ? <><span className="flex items-center gap-1.5 text-sm text-navy-600"><User className="h-4 w-4" />{user.name}</span><button className="btn-ghost" onClick={out}><LogOut className="h-4 w-4" />Log out</button></>
              : <><Link to="/login" className="btn-ghost">Log in</Link><Link to="/register" className="btn-primary">Create account</Link></>}
          </div>
          <button className="rounded-md p-2 md:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && <div className="flex flex-col gap-1 border-t border-line px-4 py-3 md:hidden">{items}
        {user ? <button className="btn-ghost mt-2" onClick={out}><LogOut className="h-4 w-4" />Log out ({user.name})</button>
          : <div className="mt-2 flex gap-2"><Link to="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1">Log in</Link><Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">Create account</Link></div>}</div>}
    </header>);
}
export const Footer = () => (
  <footer className="mt-24 bg-navy-950 text-navy-400">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
      <div><Logo dark /><p className="mt-3 max-w-xs text-sm">Wholesale supply for independent retailers, with stock levels you can trust.</p></div>
      <div className="text-sm"><h4 className="mb-2 font-bold text-white">Shop</h4><Link className="block py-1 hover:text-white" to="/products">Full catalogue</Link><Link className="block py-1 hover:text-white" to="/register">Open a retailer account</Link></div>
      <div className="text-sm"><h4 className="mb-2 font-bold text-white">Coming later</h4><p>Supplier portal, multi-warehouse stock and automated reorders are planned for future releases.</p></div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-xs">© {new Date().getFullYear()} StockPulse. Academic project, CE-1 release.</div>
  </footer>);

export function ProductCard({ p }) {
  return (
    <Link to={`/products/${p.slug}`} className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <ProductImage src={p.images?.[0]} alt={p.name} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-semibold text-em-700">{p.category}</span>
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug group-hover:text-em-700">{p.name}</h3>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div><div className="font-display text-xl font-bold">{money(p.basePrice)}</div><div className="text-xs text-navy-600">Min. order {p.minOrderQty}</div></div>
          <StockBadge status={p.stockStatus} />
        </div>
      </div>
    </Link>);
}
export const ProductGrid = ({ products }) => <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((p) => <ProductCard key={p._id} p={p} />)}</div>;

export function BulkTable({ product, qty }) {
  const rows = [{ minQty: product.minOrderQty, price: product.basePrice }, ...product.bulkTiers].sort((a, b) => a.minQty - b.minQty);
  const active = [...rows].reverse().find((r) => qty >= r.minQty);
  return (
    <table className="w-full text-sm"><thead><tr><th className="th px-0">Quantity</th><th className="th px-0 text-right">Price per unit</th></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i} className={`border-t border-line ${active === r ? 'font-bold text-em-700' : ''}`}><td className="py-2">{r.minQty}{rows[i + 1] ? `–${rows[i + 1].minQty - 1}` : '+'} units</td><td className="py-2 text-right">{money(r.price)}</td></tr>)}</tbody></table>);
}
export function OrderSummary({ lines, total }) {
  return (
    <div className="card p-5"><h2 className="text-lg font-bold">Order summary</h2>
      <ul className="mt-3 divide-y divide-line text-sm">{lines.map((l) => <li key={l._id} className="flex justify-between gap-3 py-2"><span>{l.name} <span className="text-navy-600">× {l.quantity}</span></span><span className="font-semibold">{money(l.line)}</span></li>)}</ul>
      <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{money(total)}</dd></div><div className="flex justify-between text-navy-600"><dt>Delivery</dt><dd>Quoted after confirmation</dd></div>
        <div className="flex justify-between pt-2 font-display text-xl font-bold"><dt>Total</dt><dd>{money(total)}</dd></div></dl></div>);
}
export const AdminIcon = LayoutDashboard;

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { unitPrice } from '../utils/format';
const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);
const clamp = (it, q) => Math.max(it.minOrderQty, Math.min(it.stockQuantity, Math.floor(q) || it.minOrderQty));
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('sp_cart')) || []; } catch { return []; } });
  useEffect(() => localStorage.setItem('sp_cart', JSON.stringify(items)), [items]);
  const add = (p, qty) => setItems((cur) => {
    const snap = { _id: p._id, slug: p.slug, name: p.name, sku: p.sku, image: p.images?.[0], basePrice: p.basePrice, bulkTiers: p.bulkTiers, minOrderQty: p.minOrderQty, stockQuantity: p.stockQuantity };
    const ex = cur.find((i) => i._id === p._id);
    return ex ? cur.map((i) => (i._id === p._id ? { ...snap, quantity: clamp(snap, i.quantity + qty) } : i)) : [...cur, { ...snap, quantity: clamp(snap, qty) }];
  });
  const setQty = (id, q) => setItems((cur) => cur.map((i) => (i._id === id ? { ...i, quantity: clamp(i, q) } : i)));
  const remove = (id) => setItems((cur) => cur.filter((i) => i._id !== id));
  const clear = () => setItems([]);
  const lines = useMemo(() => items.map((i) => ({ ...i, unit: unitPrice(i, i.quantity), line: unitPrice(i, i.quantity) * i.quantity })), [items]);
  const total = lines.reduce((s, l) => s + l.line, 0), count = items.reduce((s, i) => s + i.quantity, 0);
  return <Ctx.Provider value={{ lines, total, count, add, setQty, remove, clear }}>{children}</Ctx.Provider>;
}

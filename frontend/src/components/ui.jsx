import { useEffect, useState } from 'react';
import { Minus, Plus, X, Package, Inbox } from 'lucide-react';

const STOCK = { in_stock: ['In stock', 'bg-em-50 text-em-700'], low_stock: ['Low stock', 'bg-amber-100 text-warn'], out_of_stock: ['Out of stock', 'bg-red-100 text-danger'] };
export const StockBadge = ({ status }) => <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STOCK[status][1]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{STOCK[status][0]}</span>;
const ORDER = { pending: 'bg-amber-100 text-warn', confirmed: 'bg-sky-100 text-sky-800', shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-em-50 text-em-700', cancelled: 'bg-red-100 text-danger' };
export const OrderBadge = ({ status }) => <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ORDER[status]}`}>{status}</span>;

export const Skeleton = ({ className = '' }) => <div className={`animate-pulse rounded-md bg-line/70 ${className}`} />;
export const Empty = ({ title, hint, action }) => (
  <div className="card flex flex-col items-center px-6 py-14 text-center"><Inbox className="mb-3 h-8 w-8 text-navy-400" /><h3 className="text-lg font-bold">{title}</h3>{hint && <p className="mt-1 max-w-sm text-sm text-navy-600">{hint}</p>}{action && <div className="mt-5">{action}</div>}</div>
);
export const ErrorState = ({ message, onRetry }) => (
  <div className="card border-danger/30 p-6 text-center"><p className="font-semibold text-danger">{message}</p>{onRetry && <button className="btn-ghost mt-4" onClick={onRetry}>Try again</button>}</div>
);
export function ProductImage({ src, alt, className = '' }) {
  const [bad, setBad] = useState(!src);
  useEffect(() => setBad(!src), [src]);
  return bad ? <div className={`flex items-center justify-center bg-em-50 text-em-600 ${className}`}><Package className="h-10 w-10" /></div>
    : <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} className={`object-cover ${className}`} />;
}
export function Field({ label, error, hint, children }) {
  return <label className="block"><span className="mb-1 block text-sm font-semibold">{label}</span>{children}{hint && !error && <span className="mt-1 block text-xs text-navy-600">{hint}</span>}{error && <span className="mt-1 block text-xs font-medium text-danger" role="alert">{error}</span>}</label>;
}
export function QuantityInput({ value, min = 1, max, onChange }) {
  const set = (v) => onChange(Math.max(min, Math.min(max ?? Infinity, v)));
  return (
    <div className="inline-flex items-center rounded-md border border-line bg-card">
      <button type="button" aria-label="Decrease quantity" className="p-2.5 hover:bg-paper disabled:opacity-40" disabled={value <= min} onClick={() => set(value - 1)}><Minus className="h-4 w-4" /></button>
      <input aria-label="Quantity" inputMode="numeric" className="w-14 border-x border-line bg-transparent py-2 text-center text-sm font-semibold" value={value} onChange={(e) => set(parseInt(e.target.value) || min)} />
      <button type="button" aria-label="Increase quantity" className="p-2.5 hover:bg-paper disabled:opacity-40" disabled={max !== undefined && value >= max} onClick={() => set(value + 1)}><Plus className="h-4 w-4" /></button>
    </div>);
}
export function Modal({ title, onClose, children, wide }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/40 p-0 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`card max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 sm:rounded-b-lg ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><button aria-label="Close" onClick={onClose} className="rounded p-1 hover:bg-paper"><X className="h-5 w-5" /></button></div>{children}
      </div>
    </div>);
}
export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', busy, onConfirm, onCancel }) {
  return <Modal title={title} onClose={onCancel}><p className="text-sm text-navy-600">{message}</p><div className="mt-6 flex justify-end gap-2"><button className="btn-ghost" onClick={onCancel}>Cancel</button><button className="btn-danger" disabled={busy} onClick={onConfirm}>{busy ? 'Working…' : confirmLabel}</button></div></Modal>;
}
export const Kpi = ({ icon: Icon, label, value, tone = 'text-em-600' }) => (
  <div className="card p-5"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-navy-600">{label}</span><Icon className={`h-5 w-5 ${tone}`} /></div><div className="mt-2 font-display text-3xl font-bold">{value}</div></div>
);

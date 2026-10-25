import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import useFetch from '../../utils/useFetch';
import api, { errorInfo } from '../../services/api';
import { StockBadge, Skeleton, Empty, ErrorState, Modal, ConfirmDialog, Field, ProductImage } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { money } from '../../utils/format';

const blank = { name: '', sku: '', category: '', description: '', basePrice: '', minOrderQty: 1, stockQuantity: 0, lowStockThreshold: 10, targetStockLevel: 50, image: '', tiers: '', active: true };
const toForm = (p) => ({ ...p, image: p.images?.[0] || '', tiers: (p.bulkTiers || []).map((t) => `${t.minQty}:${t.price}`).join(', ') });

function ProductForm({ initial, onClose, onSaved }) {
  const [v, setV] = useState(initial ? toForm(initial) : blank), [err, setErr] = useState({}), [busy, setBusy] = useState(false), [msg, setMsg] = useState(''), toast = useToast();
  const set = (k) => (e) => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr({}); setMsg('');
    const tiers = v.tiers.split(',').map((s) => s.trim()).filter(Boolean).map((s) => { const [a, b] = s.split(':'); return { minQty: Number(a), price: Number(b) }; });
    if (tiers.some((t) => !(t.minQty >= 2) || !(t.price > 0))) return setErr({ tiers: 'Use the format 24:16.90, 60:15.40' });
    const body = { name: v.name, sku: v.sku, category: v.category, description: v.description, basePrice: Number(v.basePrice), minOrderQty: Number(v.minOrderQty), stockQuantity: Number(v.stockQuantity), lowStockThreshold: Number(v.lowStockThreshold), targetStockLevel: Number(v.targetStockLevel), images: v.image ? [v.image] : [], bulkTiers: tiers, active: v.active };
    setBusy(true);
    try { initial ? await api.put(`/products/${initial._id}`, body) : await api.post('/products', body); toast(initial ? 'Product updated' : 'Product created'); onSaved(); }
    catch (x) { const i = errorInfo(x); setErr({ ...i.fields, ...(i.fields.bulkTiers && { tiers: i.fields.bulkTiers }) }); setMsg(i.message); setBusy(false); }
  };
  const n = (k, label, hint) => <Field label={label} error={err[k]} hint={hint}><input type="number" min="0" step={k === 'basePrice' ? '0.01' : '1'} className="input" value={v[k]} onChange={set(k)} /></Field>;
  return (
    <Modal wide title={initial ? 'Edit product' : 'New product'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {msg && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-danger" role="alert">{msg}</p>}
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Name" error={err.name}><input className="input" value={v.name} onChange={set('name')} /></Field><Field label="SKU" error={err.sku}><input className="input" value={v.sku} onChange={set('sku')} /></Field>
          <Field label="Category" error={err.category}><input className="input" value={v.category} onChange={set('category')} /></Field>{n('basePrice', 'Base price (USD)')}
          {n('minOrderQty', 'Minimum order quantity')}{n('stockQuantity', 'Stock quantity')}{n('lowStockThreshold', 'Low-stock threshold', 'Flag when stock is at or below this')}{n('targetStockLevel', 'Target stock level', 'Reorder suggestion = target minus current stock')}</div>
        <Field label="Bulk tiers" error={err.tiers} hint="Quantity:price pairs, e.g. 24:16.90, 60:15.40"><input className="input" value={v.tiers} onChange={set('tiers')} /></Field>
        <Field label="Image URL" error={err.images}><input className="input" value={v.image} onChange={set('image')} placeholder="https://…" /></Field>
        <Field label="Description" error={err.description}><textarea rows={3} className="input" value={v.description} onChange={set('description')} /></Field>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={v.active} onChange={set('active')} className="h-4 w-4 accent-em-600" />Visible in the storefront</label>
        <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button className="btn-accent" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button></div>
      </form></Modal>);
}
function StockCell({ p, onDone }) {
  const [v, setV] = useState(p.stockQuantity), toast = useToast(), [busy, setBusy] = useState(false);
  useEffect(() => setV(p.stockQuantity), [p.stockQuantity]);
  const save = async () => { setBusy(true); try { await api.patch(`/inventory/${p._id}/stock`, { quantity: Number(v) }); toast(`Stock for ${p.name} set to ${v}`); onDone(); } catch (e) { toast(errorInfo(e).message, 'error'); } finally { setBusy(false); } };
  return <div className="flex items-center gap-1"><input aria-label={`Stock for ${p.name}`} type="number" min="0" className="input w-20 py-1.5" value={v} onChange={(e) => setV(e.target.value)} />{Number(v) !== p.stockQuantity && <button className="btn-primary px-2.5 py-1.5" disabled={busy} onClick={save}>Save</button>}</div>;
}
export default function AdminProducts() {
  const [q, setQ] = useState(''), [dq, setDq] = useState(''), [page, setPage] = useState(1), [form, setForm] = useState(null), [del, setDel] = useState(null), [busy, setBusy] = useState(false), toast = useToast();
  useEffect(() => { const t = setTimeout(() => { setDq(q); setPage(1); }, 300); return () => clearTimeout(t); }, [q]);
  const { data, meta, loading, error, reload } = useFetch('/inventory/products', { q: dq, page, limit: 15 });
  const remove = async () => { setBusy(true); try { await api.delete(`/products/${del._id}`); toast(`${del.name} deactivated`); setDel(null); reload(); } catch (e) { toast(errorInfo(e).message, 'error'); } finally { setBusy(false); } };
  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-bold">Products</h1><button className="btn-accent" onClick={() => setForm({})}><Plus className="h-4 w-4" />New product</button></div>
      <div className="relative mt-5 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" /><input aria-label="Search products" className="input pl-9" placeholder="Search by name or SKU" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="mt-5">{loading ? <Skeleton className="h-72" /> : error ? <ErrorState message={error} onRetry={reload} /> : !data.length ? <Empty title="No products found" hint="Try another search, or create a new product." />
        : <><div className="card overflow-x-auto"><table className="w-full min-w-[820px]"><thead className="border-b border-line"><tr><th className="th">Product</th><th className="th">Category</th><th className="th">Price</th><th className="th">Stock</th><th className="th">Status</th><th className="th text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-line">{data.map((p) => <tr key={p._id} className={p.active ? '' : 'opacity-55'}>
            <td className="td"><div className="flex items-center gap-3"><ProductImage src={p.images[0]} alt="" className="h-10 w-10 shrink-0 rounded" /><div><p className="font-semibold">{p.name}</p><p className="text-xs text-navy-600">{p.sku}{!p.active && ' · Inactive'}</p></div></div></td>
            <td className="td">{p.category}</td><td className="td">{money(p.basePrice)}</td><td className="td"><StockCell p={p} onDone={reload} /></td>
            <td className="td"><StockBadge status={p.stockStatus} />{p.suggestedReplenishment > 0 && <p className="mt-1 text-xs text-navy-600" title={p.restockReason}>Reorder {p.suggestedReplenishment}</p>}</td>
            <td className="td"><div className="flex justify-end gap-1"><button aria-label={`Edit ${p.name}`} className="rounded p-2 hover:bg-paper" onClick={() => setForm(p)}><Pencil className="h-4 w-4" /></button>{p.active && <button aria-label={`Deactivate ${p.name}`} className="rounded p-2 text-danger hover:bg-paper" onClick={() => setDel(p)}><Trash2 className="h-4 w-4" /></button>}</div></td></tr>)}</tbody></table></div>
          {meta.pages > 1 && <div className="mt-4 flex items-center justify-center gap-3"><button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span className="text-sm">Page {meta.page} of {meta.pages}</span><button className="btn-ghost" disabled={page >= meta.pages} onClick={() => setPage(page + 1)}>Next</button></div>}</>}</div>
      {form && <ProductForm initial={form._id ? form : null} onClose={() => setForm(null)} onSaved={() => { setForm(null); reload(); }} />}
      {del && <ConfirmDialog title="Deactivate product?" message={`${del.name} will be hidden from the storefront. Existing orders keep their records, and you can reactivate it by editing the product.`} confirmLabel="Deactivate" busy={busy} onConfirm={remove} onCancel={() => setDel(null)} />}
    </div>);
}

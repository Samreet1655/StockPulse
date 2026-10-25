import { useState } from 'react';
import useFetch from '../../utils/useFetch';
import api, { errorInfo } from '../../services/api';
import { OrderBadge, Skeleton, Empty, ErrorState, Modal } from '../../components/ui';
import { OrderBody } from '../OrderDetail';
import { useToast } from '../../context/ToastContext';
import { money, date } from '../../utils/format';
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { data, loading, error, reload } = useFetch('/orders'), toast = useToast();
  const [open, setOpen] = useState(null), [busy, setBusy] = useState(false);
  const change = async (status) => {
    setBusy(true);
    try { const r = await api.patch(`/orders/${open._id}/status`, { status }); setOpen(r.data.data); toast(`Order marked ${status}`); reload(); }
    catch (e) { toast(errorInfo(e).message, 'error'); } finally { setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-6xl"><h1 className="text-3xl font-bold">Orders</h1>
      <div className="mt-6">{loading ? <Skeleton className="h-64" /> : error ? <ErrorState message={error} onRetry={reload} /> : !data.length ? <Empty title="No orders yet" />
        : <div className="card overflow-x-auto"><table className="w-full min-w-[720px]"><thead className="border-b border-line"><tr><th className="th">Order</th><th className="th">Retailer</th><th className="th">Date</th><th className="th">Items</th><th className="th">Total</th><th className="th">Status</th></tr></thead>
          <tbody className="divide-y divide-line">{data.map((o) => <tr key={o._id} className="cursor-pointer hover:bg-paper" onClick={() => setOpen(o)}>
            <td className="td font-semibold"><button className="text-em-700 hover:underline" onClick={() => setOpen(o)}>#{o._id.slice(-8).toUpperCase()}</button></td><td className="td">{o.retailer?.company || o.retailer?.name}<div className="text-xs text-navy-600">{o.retailer?.email}</div></td><td className="td">{date(o.createdAt)}</td><td className="td">{o.items.reduce((s, i) => s + i.quantity, 0)} units</td><td className="td font-semibold">{money(o.total)}</td><td className="td"><OrderBadge status={o.status} /></td></tr>)}</tbody></table></div>}</div>
      {open && <Modal wide title={`Order #${open._id.slice(-8).toUpperCase()}`} onClose={() => setOpen(null)}>
        <div className="mb-4 flex flex-wrap items-center gap-3"><OrderBadge status={open.status} />
          <select aria-label="Update status" className="input max-w-[180px]" value={open.status} disabled={busy || open.status === 'cancelled'} onChange={(e) => change(e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          {open.status === 'cancelled' ? <span className="text-xs text-navy-600">Cancelled orders are locked.</span> : <span className="text-xs text-navy-600">Cancelling returns stock to inventory.</span>}</div>
        <OrderBody o={open} /></Modal>}
    </div>);
}

import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import useFetch from '../utils/useFetch';
import { OrderBadge, Skeleton, ErrorState, ProductImage } from '../components/ui';
import { money, date } from '../utils/format';
import { useAuth } from '../context/AuthContext';

export function OrderBody({ o }) {
  return (
    <div className="space-y-6">
      <div className="card divide-y divide-line">{o.items.map((i) => <div key={i.sku} className="flex items-center gap-4 p-4"><ProductImage src={i.image} alt="" className="h-14 w-14 shrink-0 rounded-md" /><div className="min-w-0 flex-1"><p className="font-semibold">{i.name}</p><p className="text-xs text-navy-600">{i.sku} · {i.quantity} × {money(i.unitPrice)}</p></div><span className="font-bold">{money(i.lineTotal)}</span></div>)}
        <div className="flex justify-between p-4 font-display text-xl font-bold"><span>Total</span><span>{money(o.total)}</span></div></div>
      <div className="card p-5 text-sm"><h3 className="mb-2 font-bold">Delivery</h3><p>{o.delivery.contactName}{o.delivery.company && `, ${o.delivery.company}`}</p><p>{o.delivery.address}, {o.delivery.city} {o.delivery.postalCode}</p><p>{o.delivery.phone}</p>{o.delivery.notes && <p className="mt-2 text-navy-600">Notes: {o.delivery.notes}</p>}</div>
    </div>);
}
export default function OrderDetail() {
  const { id } = useParams(), { state } = useLocation(), { isAdmin } = useAuth(), { data: o, loading, error, reload } = useFetch(`/orders/${id}`);
  if (loading) return <div className="mx-auto max-w-3xl space-y-4 px-4 py-10"><Skeleton className="h-16" /><Skeleton className="h-64" /></div>;
  if (error) return <div className="mx-auto max-w-xl px-4 py-16"><ErrorState message={error} onRetry={reload} /></div>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {state?.confirmed && <div className="mb-6 flex items-start gap-3 rounded-lg bg-em-50 p-5"><CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-em-600" /><div><h1 className="text-xl font-bold">Order placed. Thank you.</h1><p className="text-sm text-navy-600">We reserved your stock and sent the order to the supplier for confirmation.</p></div></div>}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-2xl font-bold">Order #{o._id.slice(-8).toUpperCase()}</h2><p className="text-sm text-navy-600">Placed {date(o.createdAt)} · Full ID {o._id}</p></div><OrderBadge status={o.status} /></div>
      <OrderBody o={o} />
      <div className="mt-6 flex gap-2"><Link to={isAdmin ? '/admin/orders' : '/account/orders'} className="btn-ghost">View all orders</Link>{!isAdmin && <Link to="/products" className="btn-primary">Continue shopping</Link>}</div>
    </div>);
}

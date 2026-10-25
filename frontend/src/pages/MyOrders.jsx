import { Link } from 'react-router-dom';
import useFetch from '../utils/useFetch';
import { OrderBadge, Skeleton, Empty, ErrorState } from '../components/ui';
import { money, date } from '../utils/format';
export default function MyOrders() {
  const { data, loading, error, reload } = useFetch('/orders/mine');
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6"><h1 className="text-3xl font-bold">My orders</h1>
      <div className="mt-6">{loading ? <Skeleton className="h-48" /> : error ? <ErrorState message={error} onRetry={reload} />
        : !data.length ? <Empty title="No orders yet" hint="Orders you place will appear here." action={<Link to="/products" className="btn-primary">Browse products</Link>} />
        : <div className="space-y-3">{data.map((o) => <Link key={o._id} to={`/orders/${o._id}`} className="card flex items-center justify-between gap-3 p-4 hover:shadow-md"><div><p className="font-bold">#{o._id.slice(-8).toUpperCase()}</p><p className="text-sm text-navy-600">{date(o.createdAt)} · {o.items.length} item{o.items.length > 1 && 's'}</p></div><div className="flex items-center gap-4"><span className="font-bold">{money(o.total)}</span><OrderBadge status={o.status} /></div></Link>)}</div>}</div></div>);
}

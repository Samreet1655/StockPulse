import { Link } from 'react-router-dom';
import { Boxes, Layers, AlertTriangle, PackageX } from 'lucide-react';
import useFetch from '../../utils/useFetch';
import { Kpi, Skeleton, StockBadge, Empty, ErrorState } from '../../components/ui';

export default function Dashboard() {
  const s = useFetch('/inventory/summary'), low = useFetch('/inventory/low-stock');
  return (
    <div className="mx-auto max-w-6xl"><h1 className="text-3xl font-bold">Inventory overview</h1>
      <p className="mt-1 text-navy-600">Live figures from active products. A product is flagged when its stock is at or below its alert threshold.</p>
      {s.error ? <div className="mt-6"><ErrorState message={s.error} onRetry={s.reload} /></div> : <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{s.loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />) : <>
        <Kpi icon={Boxes} label="Total products" value={s.data.totalProducts} /><Kpi icon={Layers} label="Units in stock" value={s.data.totalUnits.toLocaleString()} />
        <Kpi icon={AlertTriangle} label="Low stock" value={s.data.lowStock} tone="text-warn" /><Kpi icon={PackageX} label="Out of stock" value={s.data.outOfStock} tone="text-danger" /></>}</div>}
      <div className="mt-10 flex items-end justify-between"><h2 className="text-xl font-bold">Needs restocking</h2><Link className="text-sm font-semibold text-em-700 hover:underline" to="/admin/products">Manage products</Link></div>
      <div className="mt-4">{low.loading ? <Skeleton className="h-48" /> : low.error ? <ErrorState message={low.error} onRetry={low.reload} /> : !low.data.length ? <Empty title="Everything is stocked" hint="No product is at or below its alert threshold." />
        : <div className="card divide-y divide-line">{low.data.map((p) => <div key={p._id} className="flex flex-wrap items-start justify-between gap-3 p-4"><div className="min-w-0 max-w-xl"><p className="font-bold">{p.name} <span className="font-normal text-navy-600">· {p.sku}</span></p><p className="mt-1 text-sm text-navy-600">{p.restockReason}</p></div>
          <div className="text-right"><StockBadge status={p.stockStatus} /><p className="mt-1 text-sm font-semibold">Reorder {p.suggestedReplenishment} units</p></div></div>)}</div>}</div>
    </div>);
}

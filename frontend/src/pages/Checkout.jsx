import { useNavigate, Navigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useCart } from '../context/CartContext'; import { useAuth } from '../context/AuthContext'; import { useToast } from '../context/ToastContext';
import { Field } from '../components/ui'; import { OrderSummary } from '../components/shop';
import api, { errorInfo } from '../services/api';

export default function Checkout() {
  const { lines, total, clear } = useCart(), { user } = useAuth(), nav = useNavigate(), toast = useToast();
  const reqId = useRef(crypto.randomUUID()); // same id on retries, so a double click cannot create two orders
  const [v, setV] = useState({ contactName: user.name || '', company: user.company || '', phone: user.phone || '', address: user.address || '', city: '', postalCode: '', notes: '' });
  const [err, setErr] = useState({}), [msg, setMsg] = useState(''), [busy, setBusy] = useState(false), done = useRef(false);
  if (!lines.length && !done.current) return <Navigate to="/cart" replace />;
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); if (busy) return;
    const l = {};
    if (v.contactName.trim().length < 2) l.contactName = 'Enter a contact name';
    if (!/^[0-9+()\-\s]{7,20}$/.test(v.phone.trim())) l.phone = 'Enter a valid phone number';
    if (v.address.trim().length < 5) l.address = 'Enter the street address';
    if (!v.city.trim()) l.city = 'Enter the city';
    if (!v.postalCode.trim()) l.postalCode = 'Enter the postal code';
    setErr(l); setMsg('');
    if (Object.keys(l).length) return;
    setBusy(true);
    try {
      const r = await api.post('/orders', { clientRequestId: reqId.current, delivery: v, items: lines.map((x) => ({ productId: x._id, quantity: x.quantity })) });
      done.current = true; clear(); toast('Order placed'); nav(`/orders/${r.data.data._id}`, { replace: true, state: { confirmed: true } });
    } catch (x) { const i = errorInfo(x); setErr(i.fields); setMsg(i.message); setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <form onSubmit={submit} noValidate className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="card space-y-4 p-6">
          <h2 className="text-lg font-bold">Delivery details</h2>
          {msg && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-danger" role="alert">{msg}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact name" error={err.contactName}><input className="input" value={v.contactName} onChange={set('contactName')} /></Field>
            <Field label="Company"><input className="input" value={v.company} onChange={set('company')} /></Field>
            <Field label="Phone" error={err.phone}><input className="input" value={v.phone} onChange={set('phone')} /></Field>
            <Field label="City" error={err.city}><input className="input" value={v.city} onChange={set('city')} /></Field></div>
          <Field label="Street address" error={err.address}><input className="input" value={v.address} onChange={set('address')} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Postal code" error={err.postalCode}><input className="input" value={v.postalCode} onChange={set('postalCode')} /></Field></div>
          <Field label="Delivery notes (optional)"><textarea rows={3} className="input" value={v.notes} onChange={set('notes')} /></Field>
          <p className="text-sm text-navy-600">No payment is taken in this release. The supplier confirms your order and sends an invoice.</p>
        </div>
        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start"><OrderSummary lines={lines} total={total} /><button className="btn-accent w-full py-3" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button></div>
      </form>
    </div>);
}

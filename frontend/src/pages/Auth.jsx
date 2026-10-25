import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext'; import { useToast } from '../context/ToastContext';
import { Field } from '../components/ui';
import { errorInfo } from '../services/api';

function AuthForm({ mode }) {
  const reg = mode === 'register', { login, register } = useAuth(), nav = useNavigate(), loc = useLocation(), toast = useToast();
  const [v, setV] = useState({ name: '', email: '', password: '', company: '' }), [err, setErr] = useState({}), [busy, setBusy] = useState(false), [msg, setMsg] = useState('');
  const set = (k) => (e) => setV({ ...v, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr({}); setMsg('');
    const local = {};
    if (reg && v.name.trim().length < 2) local.name = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(v.email)) local.email = 'Enter a valid email address';
    if (v.password.length < (reg ? 8 : 1)) local.password = reg ? 'Use at least 8 characters' : 'Enter your password';
    if (Object.keys(local).length) { setErr(local); setBusy(false); return; }
    try {
      const u = await (reg ? register(v) : login(v));
      toast(reg ? 'Account created. Welcome to StockPulse.' : `Welcome back, ${u.name}.`);
      nav(loc.state?.from && u.role !== 'admin' ? loc.state.from : u.role === 'admin' ? '/admin' : '/products', { replace: true });
    } catch (x) { const i = errorInfo(x); setErr(i.fields); setMsg(i.message); setBusy(false); }
  };
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <form onSubmit={submit} noValidate className="card space-y-4 p-6 sm:p-8">
        <h1 className="text-2xl font-bold">{reg ? 'Create a retailer account' : 'Log in to StockPulse'}</h1>
        {msg && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-danger" role="alert">{msg}</p>}
        {reg && <><Field label="Full name" error={err.name}><input className="input" value={v.name} onChange={set('name')} autoComplete="name" /></Field>
          <Field label="Company (optional)"><input className="input" value={v.company} onChange={set('company')} autoComplete="organization" /></Field></>}
        <Field label="Email" error={err.email}><input type="email" className="input" value={v.email} onChange={set('email')} autoComplete="email" /></Field>
        <Field label="Password" error={err.password} hint={reg ? 'At least 8 characters' : undefined}><input type="password" className="input" value={v.password} onChange={set('password')} autoComplete={reg ? 'new-password' : 'current-password'} /></Field>
        <button className="btn-accent w-full py-3" disabled={busy}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Log in'}</button>
        <p className="text-center text-sm text-navy-600">{reg ? <>Already registered? <Link className="font-semibold text-em-700" to="/login" state={loc.state}>Log in</Link></> : <>New retailer? <Link className="font-semibold text-em-700" to="/register" state={loc.state}>Create an account</Link></>}</p>
      </form>
    </div>);
}
export const Login = () => <AuthForm mode="login" />;
export const Register = () => <AuthForm mode="register" />;

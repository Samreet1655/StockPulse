import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Boxes, ClipboardList, LogOut, Store, Menu, X } from 'lucide-react';
import { Navbar, Footer, Logo } from '../components/shop';
import { useAuth } from '../context/AuthContext';

export const ShopLayout = () => <div className="flex min-h-screen flex-col"><Navbar /><main className="flex-1"><Outlet /></main><Footer /></div>;

export function AdminLayout() {
  const { user, logout } = useAuth(), nav = useNavigate(), [open, setOpen] = useState(false);
  const cls = ({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-white/10 text-white' : 'text-navy-400 hover:text-white'}`;
  const side = (
    <div className="flex h-full flex-col p-4"><Logo dark />
      <nav className="mt-8 flex flex-col gap-1" onClick={() => setOpen(false)}>
        <NavLink end to="/admin" className={cls}><LayoutDashboard className="h-4 w-4" />Overview</NavLink>
        <NavLink to="/admin/products" className={cls}><Boxes className="h-4 w-4" />Products</NavLink>
        <NavLink to="/admin/orders" className={cls}><ClipboardList className="h-4 w-4" />Orders</NavLink></nav>
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4 text-sm">
        <div className="px-3 pb-2 text-navy-400">{user.name}</div>
        <Link to="/" className={cls({ isActive: false })}><Store className="h-4 w-4" />View storefront</Link>
        <button className={`${cls({ isActive: false })} w-full`} onClick={() => { logout(); nav('/'); }}><LogOut className="h-4 w-4" />Log out</button></div></div>);
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-60 shrink-0 bg-navy-950 lg:block">{side}</aside>
      <div className="flex items-center justify-between bg-navy-950 px-4 py-3 text-white lg:hidden"><Logo dark /><button aria-label="Menu" onClick={() => setOpen(true)}><Menu /></button></div>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} /><aside className="relative h-full w-64 bg-navy-950"><button aria-label="Close menu" className="absolute right-3 top-4 text-white" onClick={() => setOpen(false)}><X /></button>{side}</aside></div>}
      <main className="min-w-0 flex-1 p-4 sm:p-8"><Outlet /></main>
    </div>);
}

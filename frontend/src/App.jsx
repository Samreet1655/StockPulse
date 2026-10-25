import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ShopLayout, AdminLayout } from './layouts/Layouts';
import Home from './pages/Home'; import Catalogue from './pages/Catalogue'; import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart'; import Checkout from './pages/Checkout'; import OrderDetail from './pages/OrderDetail'; import MyOrders from './pages/MyOrders';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/admin/Dashboard'; import AdminProducts from './pages/admin/Products'; import AdminOrders from './pages/admin/Orders';

function Guard({ role, children }) {
  const { user } = useAuth(), loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
  return children;
}
export default function App() {
  return (
    <Routes>
      <Route element={<ShopLayout />}>
        <Route index element={<Home />} /><Route path="products" element={<Catalogue />} /><Route path="products/:slug" element={<ProductDetail />} />
        <Route path="cart" element={<Cart />} /><Route path="login" element={<Login />} /><Route path="register" element={<Register />} />
        <Route path="checkout" element={<Guard role="retailer"><Checkout /></Guard>} />
        <Route path="orders/:id" element={<Guard><OrderDetail /></Guard>} />
        <Route path="account/orders" element={<Guard role="retailer"><MyOrders /></Guard>} />
      </Route>
      <Route path="admin" element={<Guard role="admin"><AdminLayout /></Guard>}>
        <Route index element={<Dashboard />} /><Route path="products" element={<AdminProducts />} /><Route path="orders" element={<AdminOrders />} />
      </Route>
      <Route path="*" element={<div className="p-20 text-center"><h1 className="text-3xl font-bold">Page not found</h1><a className="btn-primary mt-6" href="/">Back to home</a></div>} />
    </Routes>);
}

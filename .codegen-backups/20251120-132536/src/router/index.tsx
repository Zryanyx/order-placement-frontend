import AdminUserAddressList from '@/pages/Admin/UserAddressList'
import AdminUserAddressForm from '@/pages/Admin/UserAddressForm'
import AdminCategoryList from '@/pages/Admin/CategoryList'
import AdminCategoryForm from '@/pages/Admin/CategoryForm'

import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '@/App';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import ProductList from '@/pages/Product/ProductList';
import ProductDetail from '@/pages/Product/ProductDetail';
import Cart from '@/pages/Cart/Cart';
import OrderCreate from '@/pages/Order/OrderCreate';
import OrderList from '@/pages/Order/OrderList';
import OrderDetail from '@/pages/Order/OrderDetail';
import AdminProductList from '@/pages/Admin/ProductList';
import AdminProductForm from '@/pages/Admin/ProductForm';
import AdminOrderList from '@/pages/Admin/OrderList';
import ProtectedRoute from '@/components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/products" replace />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'products',
        element: <ProductList />,
      },
      {
        path: 'products/:id',
        element: <ProductDetail />,
      },
      {
        path: 'cart',
        element: (
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <OrderList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/create',
        element: (
          <ProtectedRoute>
            <OrderCreate />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminProductList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products/new',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminProductForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/products/:id/edit',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminProductForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/orders',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminOrderList />
          </ProtectedRoute>
        ),
      },
{
        path: 'admin/category',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminCategoryList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/category/new',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminCategoryForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/category/:id/edit',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminCategoryForm />
          </ProtectedRoute>
        ),
      },
{
        path: 'admin/user-addresses',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminUserAddressList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/user-addresses/new',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminUserAddressForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/user-addresses/:id/edit',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminUserAddressForm />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);


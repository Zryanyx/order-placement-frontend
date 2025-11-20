import AdminSystemConfigList from '@/pages/Admin/SystemConfigList'
import AdminSystemConfigForm from '@/pages/Admin/SystemConfigForm'
import AdminCommentList from '@/pages/Admin/CommentList'
import AdminCommentForm from '@/pages/Admin/CommentForm'
import AdminArticleList from '@/pages/Admin/ArticleList'
import AdminArticleForm from '@/pages/Admin/ArticleForm'
import AdminProductManagementList from '@/pages/Admin/ProductManagementList'
import AdminProductManagementForm from '@/pages/Admin/ProductManagementForm'
import AdminProductCategoryList from '@/pages/Admin/ProductCategoryList'
import AdminProductCategoryForm from '@/pages/Admin/ProductCategoryForm'
import AdminUserAddressList from '@/pages/Admin/UserAddressList'
import AdminUserAddressForm from '@/pages/Admin/UserAddressForm'

import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '@/App';
import Login from '@/pages/Auth/Login';
import Register from '@/pages/Auth/Register';
import Blank from '@/pages/Blank';

import ProtectedRoute from '@/components/ProtectedRoute';
import DefaultRedirect from '@/components/DefaultRedirect';
import { RouteErrorBoundary } from '@/components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <DefaultRedirect />,
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
        path: 'blank',
        element: <Blank />,
      },
      {
        path: 'user-dashboard',
        element: (
          <ProtectedRoute>
            <Blank />
          </ProtectedRoute>
        ),
      },

{
        path: 'admin/useraddress',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminUserAddressList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/useraddress/new',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminUserAddressForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/useraddress/:id/edit',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminUserAddressForm />
          </ProtectedRoute>
        ),
      },
{
        path: 'admin/productcategory',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminProductCategoryList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/productcategory/new',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminProductCategoryForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/productcategory/:id/edit',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminProductCategoryForm />
          </ProtectedRoute>
        ),
      },
{
        path: 'admin/productmanagement',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminProductManagementList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/productmanagement/new',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminProductManagementForm />
          </ProtectedRoute>
        ),
      },
 {
         path: 'admin/productmanagement/:id/edit',
         element: (
           <ProtectedRoute requireAdmin>
             <AdminProductManagementForm />
           </ProtectedRoute>
         ),
       },

{
        path: 'admin/article',
        element: (
          <ProtectedRoute>
            <AdminArticleList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/article/new',
        element: (
          <ProtectedRoute>
            <AdminArticleForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/article/:id/edit',
        element: (
          <ProtectedRoute>
            <AdminArticleForm />
          </ProtectedRoute>
        ),
      },
{
        path: 'admin/comment',
        element: (
          <ProtectedRoute>
            <AdminCommentList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/comment/new',
        element: (
          <ProtectedRoute>
            <AdminCommentForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/comment/:id/edit',
        element: (
          <ProtectedRoute>
            <AdminCommentForm />
          </ProtectedRoute>
        ),
      },
{
        path: 'admin/systemconfig',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminSystemConfigList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/systemconfig/new',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminSystemConfigForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/systemconfig/:id/edit',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminSystemConfigForm />
          </ProtectedRoute>
        ),
      },



    ],
  },
]);






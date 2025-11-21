
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



      

    ],
  },
]);






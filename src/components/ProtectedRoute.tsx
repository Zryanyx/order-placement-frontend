import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'ADMIN') {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;


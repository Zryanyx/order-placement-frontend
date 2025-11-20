import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from '@/components/Layout';
import ThreeLevelLayout from '@/components/ThreeLevelLayout';
import AuthLayout from '@/components/AuthLayout';
import { useAuthStore } from '@/store/authStore';

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const location = useLocation();

  useEffect(() => {
    initAuth();
  }, [initAuth, '/admin/category', '/admin/user-addresses']);

  // 需要三级独立滚动布局的页面（所有主要页面）
  const useThreeLevelLayout = [
    '/products',
    '/orders',
    '/orders/create',
    '/cart',
    '/admin'
  ].some(path => location.pathname.startsWith(path));

  // 需要认证布局的页面（登录、注册）
  const useAuthLayout = ['/login', '/register'].includes(location.pathname);

  return (
    <ConfigProvider locale={zhCN}>
      {useAuthLayout ? (
        <AuthLayout>
          <Outlet />
        </AuthLayout>
      ) : useThreeLevelLayout ? (
        <ThreeLevelLayout>
          <Outlet />
        </ThreeLevelLayout>
      ) : (
        <Layout>
          <Outlet />
        </Layout>
      )}
    </ConfigProvider>
  );
}

export default App;


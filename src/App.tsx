import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ConfigProvider locale={zhCN}>
      <Layout>
        <Outlet />
      </Layout>
    </ConfigProvider>
  );
}

export default App;


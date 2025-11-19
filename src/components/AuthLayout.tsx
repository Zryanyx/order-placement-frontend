import { ReactNode } from 'react';
import { Layout as AntLayout, Menu, Button, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content } = AntLayout;

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: any[] = [
    // 登录页面不显示商品列表按钮，只保留系统标题
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            style={{ fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', color: '#1890ff' }}
            onClick={() => navigate('/products')}
          >
            Java国内多商户管理系统
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ border: 'none', flex: 1 }}
          />
        </div>
        <Space size="large">
          <Button type="text" onClick={() => navigate('/login')}>
            登录
          </Button>
          <Button type="primary" onClick={() => navigate('/register')}>
            注册
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {children}
      </Content>
    </AntLayout>
  );
};

export default AuthLayout;
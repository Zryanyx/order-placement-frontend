import { ReactNode } from 'react';
import { Layout as AntLayout, Menu, Button, Badge, Dropdown, Avatar, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  ShopOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const cartCount = useCartStore((state) => state.getTotalCount());

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'orders',
      label: '我的订单',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'logout',
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const adminMenuItems = [
    {
      key: 'admin-products',
      label: '商品管理',
      onClick: () => navigate('/admin/products'),
    },
    {
      key: 'admin-orders',
      label: '订单管理',
      onClick: () => navigate('/admin/orders'),
    },
  ];

  const menuItems = [
    {
      key: '/products',
      label: '商品列表',
      onClick: () => navigate('/products'),
    },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({
      key: '/admin/products',
      label: '商品管理',
      onClick: () => navigate('/admin/products'),
    });
    menuItems.push({
      key: '/admin/orders',
      label: '订单管理',
      onClick: () => navigate('/admin/orders'),
    });
  }

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
            style={{ 
              border: 'none', 
              flex: 1,
              lineHeight: '64px',
              minWidth: 0,
              overflow: 'visible',
              fontSize: '14px',
              fontWeight: 'normal'
            }}
            theme="light"
            overflowedIndicator={null}
          />
        </div>
        <Space size="large">
          {isAuthenticated ? (
            <>
              <Badge count={cartCount} size="small">
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />}
                  onClick={() => navigate('/cart')}
                />
              </Badge>
              <Dropdown
                menu={{
                  items: [
                    ...(user?.role === 'ADMIN' ? adminMenuItems : []),
                    ...userMenuItems,
                  ],
                }}
                placement="bottomRight"
              >
                <Space style={{ cursor: 'pointer' }}>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user?.username}</span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <>
              <Button type="text" onClick={() => navigate('/login')}>
                登录
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
              </Button>
            </>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;


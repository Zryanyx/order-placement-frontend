import { ReactNode } from 'react';
import { Layout as AntLayout, Menu, Button, Badge, Dropdown, Avatar, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  ShopOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const { Header, Sider, Content } = AntLayout;

interface SplitLayoutProps {
  children: ReactNode;
}

const SplitLayout = ({ children }: SplitLayoutProps) => {
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
      icon: <UnorderedListOutlined />,
      label: '我的订单',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const adminMenuItems = [
    {
      key: 'admin-products',
      icon: <ShopOutlined />,
      label: '商品管理',
      onClick: () => navigate('/admin/products'),
    },
    {
      key: 'admin-orders',
      icon: <UnorderedListOutlined />,
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
    {
      key: '/orders',
      label: '我的订单',
      onClick: () => navigate('/orders'),
    },
    {
      key: '/cart',
      label: '购物车',
      onClick: () => navigate('/cart'),
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
      {/* 顶部导航栏 */}
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        background: '#fff', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '64px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            style={{ fontSize: '20px', fontWeight: 'bold', cursor: 'pointer', color: '#1890ff' }}
            onClick={() => navigate('/products')}
          >
            Java国内多商户管理系统
          </div>
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

      {/* 主要内容区域 */}
      <AntLayout style={{ marginTop: '64px', height: 'calc(100vh - 64px)' }}>
        {/* 左侧边栏 - 菜单按钮 */}
        <Sider
          width={200}
          style={{
            background: '#fff',
            borderRight: '1px solid #f0f0f0',
            height: '100%',
            overflow: 'auto'
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ border: 'none', height: '100%' }}
          />
        </Sider>

        {/* 右侧内容区域 */}
        <Content style={{ 
          background: '#f0f2f5', 
          height: '100%',
          overflow: 'auto',
          padding: '24px'
        }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default SplitLayout;
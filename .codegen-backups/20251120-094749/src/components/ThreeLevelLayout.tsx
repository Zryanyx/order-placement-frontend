import { ReactNode, useState } from 'react';
import { Layout as AntLayout, Menu, Button, Badge, Dropdown, Avatar, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShopOutlined,
  UnorderedListOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const { Header, Sider, Content } = AntLayout;

interface ThreeLevelLayoutProps {
  children: ReactNode;
}

// 菜单项类型定义
interface MenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  children?: MenuItem[];
  onClick?: () => void;
}

const ThreeLevelLayout = ({ children }: ThreeLevelLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const cartCount = useCartStore((state) => state.getTotalCount());

  // 当前选中的顶级菜单
  const [selectedTopMenu, setSelectedTopMenu] = useState<string>('products');

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // 用户菜单项
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

  // 三级菜单数据结构
  const menuData: Record<string, MenuItem[]> = {
    // 商品菜单
    products: [
      {
        key: 'product-list',
        label: '商品列表',
        onClick: () => navigate('/products'),
      },
      {
        key: 'cart',
        label: '购物车',
        onClick: () => navigate('/cart'),
      },
      ...(user?.role === 'ADMIN' ? [
        {
          key: 'product-management',
          label: '商品管理',
          children: [
            {
              key: '/admin/products',
              label: '商品列表',
              onClick: () => navigate('/admin/products'),
            },
            {
              key: '/admin/products/create',
              label: '添加商品',
              onClick: () => navigate('/admin/products/create'),
            },
            {
              key: '/admin/products/categories',
              label: '商品分类',
              onClick: () => navigate('/admin/products/categories'),
            },
          ],
        },
      ] : []),
    ],
    // 订单菜单
    orders: [
      {
        key: 'my-orders',
        label: '我的订单',
        onClick: () => navigate('/orders'),
      },
      ...(user?.role === 'ADMIN' ? [
        {
          key: 'order-management',
          label: '订单管理',
          children: [
            {
              key: '/admin/orders',
              label: '订单列表',
              onClick: () => navigate('/admin/orders'),
            },
            {
              key: '/admin/orders/pending',
              label: '待处理订单',
              onClick: () => navigate('/admin/orders/pending'),
            },
            {
              key: '/admin/orders/statistics',
              label: '订单统计',
              onClick: () => navigate('/admin/orders/statistics'),
            },
          ],
        },
      ] : []),
    ],
  };

  // 顶级菜单
  const topMenuItems = [
    {
      key: 'products',
      label: '商品',
      icon: <ShopOutlined />,
    },
    {
      key: 'orders',
      label: '订单',
      icon: <UnorderedListOutlined />,
    },
  ];

  // 获取当前选中的二级菜单
  const currentSecondLevelMenus = menuData[selectedTopMenu] || [];

  // 自定义菜单渲染函数，处理三级菜单的下拉框显示
  const renderMenuItems = (items: MenuItem[]) => {
    return items.map(item => {
      if (item.children && item.children.length > 0) {
        // 如果有子菜单，使用Dropdown显示
        return {
          ...item,
          children: item.children.map(child => ({
            ...child,
            // 三级菜单直接显示，四级菜单会在Dropdown中展开
            children: child.children ? [
              {
                key: `${child.key}-dropdown`,
                label: (
                  <Dropdown
                    menu={{
                      items: child.children.map(grandChild => ({
                        ...grandChild,
                        onClick: grandChild.onClick
                      }))
                    }}
                    placement="rightTop"
                    trigger={['click']}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{child.label}</span>
                      <DownOutlined style={{ fontSize: '12px' }} />
                    </div>
                  </Dropdown>
                )
              }
            ] : undefined
          }))
        };
      }
      return item;
    });
  };

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
                  items: userMenuItems,
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

      {/* 三级菜单布局 */}
      <AntLayout style={{ marginTop: '64px', height: 'calc(100vh - 64px)' }}>
        {/* 第一级：顶级菜单（最左侧） */}
        <Sider
          width={120}
          style={{
            background: '#fafafa',
            borderRight: '1px solid #f0f0f0',
            height: '100%',
            overflow: 'auto'
          }}
        >
          <Menu
            mode="vertical"
            selectedKeys={[selectedTopMenu]}
            items={topMenuItems.map(item => ({
              ...item,
              onClick: () => setSelectedTopMenu(item.key),
            }))}
            style={{ 
              border: 'none', 
              height: '100%',
              background: 'transparent'
            }}
          />
        </Sider>

        {/* 第二级：二级菜单（顶级菜单右侧） */}
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
            items={renderMenuItems(currentSecondLevelMenus)}
            style={{ 
              border: 'none', 
              height: '100%' 
            }}
          />
        </Sider>

        {/* 第三级：内容区域 */}
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

export default ThreeLevelLayout;
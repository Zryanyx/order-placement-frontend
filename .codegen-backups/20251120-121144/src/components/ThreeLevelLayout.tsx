import { generatedMenuData, generatedTopMenuItems } from '@/menu-integration'
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

  // 原有菜单配置（从Layout.tsx中提取）
  const originalMenuData: Record<string, MenuItem[]> = {
    products: [
      {
        key: '商品列表',
        label: '商品列表',
        onClick: () => navigate('/products'),
      },
    ],
    orders: [
      {
        key: '我的订单',
        label: '我的订单',
        onClick: () => navigate('/orders'),
      },
    ],
  };

  // 管理员专属菜单
  if (user?.role === 'ADMIN') {
    originalMenuData.products.push({
      key: '商品管理',
      label: '商品管理',
      role: 'ADMIN',
      onClick: () => navigate('/admin/products'),
    });
    originalMenuData.orders.push({
      key: '订单管理',
      label: '订单管理',
      role: 'ADMIN',
      onClick: () => navigate('/admin/orders'),
    });
  }

  // 合并原有菜单和生成器菜单
  const mergedMenuData: Record<string, MenuItem[]> = { ...originalMenuData };
  
  // 将生成器菜单合并到对应顶级菜单下
  Object.keys(generatedMenuData).forEach(topKey => {
    if (!mergedMenuData[topKey]) {
      mergedMenuData[topKey] = [];
    }
    // 合并生成器菜单项到原有菜单
    generatedMenuData[topKey].forEach(generatedItem => {
      const existingIndex = mergedMenuData[topKey].findIndex(item => item.key === generatedItem.key);
      if (existingIndex === -1) {
        mergedMenuData[topKey].push(generatedItem);
      } else {
        // 如果存在相同key的菜单项，用生成器的配置覆盖原有配置
        mergedMenuData[topKey][existingIndex] = generatedItem;
      }
    });
  });

  // 三级菜单数据结构 - 使用合并后的菜单配置
  const menuData = mergedMenuData;

  // 顶级菜单
  const baseTopMenuItems = [
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
  ]
const topMenuItems = [ ...baseTopMenuItems, ...generatedTopMenuItems ].filter((v, i, arr) => arr.findIndex(x => x.key === v.key) === i)

  // 根据用户角色过滤菜单项
  const filterMenuByRole = (items: MenuItem[]): MenuItem[] => {
    return items.filter(item => {
      // 如果没有设置role字段，或者用户角色匹配，或者用户是管理员，则显示该菜单项
      if (!item.role || user?.role === item.role || user?.role === 'ADMIN') {
        // 递归过滤子菜单
        if (item.children && item.children.length > 0) {
          item.children = filterMenuByRole(item.children);
          // 如果过滤后子菜单为空，则隐藏该父菜单
          return item.children.length > 0;
        }
        return true;
      }
      return false;
    });
  };

  // 获取当前选中的二级菜单，并根据权限过滤
  const currentSecondLevelMenus = filterMenuByRole(menuData[selectedTopMenu] || []);

  // 根据权限过滤顶级菜单
  const filteredTopMenuItems = filterMenuByRole(topMenuItems);

  // 自定义菜单渲染函数，处理三级菜单的下拉框显示
  const renderMenuItems = (items: MenuItem[]) => {
    return items.map(item => {
      if (item.children && item.children.length > 0) {
        // 如果有子菜单，使用Dropdown显示
        return {
          ...item,
          children: item.children.map(child => ({
            ...child,
            // 为子菜单项自动添加导航功能
            onClick: child.onClick || (child.key.startsWith('/') ? () => navigate(child.key) : undefined),
            // 三级菜单直接显示，四级菜单会在Dropdown中展开
            children: child.children ? [
              {
                key: `${child.key}-dropdown`,
                label: (
                  <Dropdown
                    menu={{
                      items: child.children.map(grandChild => ({
                        ...grandChild,
                        onClick: grandChild.onClick || (grandChild.key.startsWith('/') ? () => navigate(grandChild.key) : undefined)
                      }))
                    } as any}
                    placement="topRight"
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
      // 对于没有子菜单的菜单项，确保onClick事件被正确传递
      return {
        ...item,
        onClick: item.onClick || (item.key.startsWith('/') ? () => navigate(item.key) : undefined)
      };
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
            items={filteredTopMenuItems.map(item => ({
              ...item,
              onClick: () => setSelectedTopMenu(item.key),
            })) as any}
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
            items={renderMenuItems(currentSecondLevelMenus) as any}
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
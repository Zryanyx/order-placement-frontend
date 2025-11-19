// 自动生成的ThreeLevelLayout菜单配置
// 请将此配置导入到ThreeLevelLayout组件的menuData中

import { ReactNode } from 'react';
import { UnorderedListOutlined, UserOutlined, ShopOutlined, DollarOutlined } from '@ant-design/icons';

// 菜单项类型定义
interface MenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  children?: MenuItem[];
  onClick?: () => void;
  role?: string;
}

// 生成的顶级菜单配置（用于ThreeLevelLayout的topMenuItems）
export const generatedTopMenuItems = [
  {
    key: 'admin',
    label: 'admin',
    icon: <UnorderedListOutlined />,
    role: 'ALL',
  },
  {
    key: 'user',
    label: 'user',
    icon: <UnorderedListOutlined />,
    role: 'ALL',
  },
  {
    key: 'finance',
    label: '财务',
    icon: <DollarOutlined />,
    role: 'ADMIN',
  },
];

// 生成的菜单数据
export const generatedMenuData: Record<string, MenuItem[]> = {
  // admin顶级菜单
  admin: [
    {
      key: '商品分类管理',
      label: '商品分类管理',
      role: 'ADMIN',
      children: [
        {
          key: '/admin/category',
          label: '商品分类列表',
          role: 'ADMIN',
        }
      
    {
          key: '商品分类管理',
          label: '商品分类管理',
          role: 'ADMIN',
          children: [
            { key: '/admin/categories', label: '商品分类列表', role: 'ADMIN' }
          
    {
          key: '用户地址管理',
          label: '用户地址管理',
          role: 'ADMIN',
          children: [
            { key: '/admin/user-addresses', label: '用户地址列表', role: 'ADMIN' }
          ]
        }]
        }],
    }
  ],

  // user顶级菜单
  user: [
    {
      key: '用户管理',
      label: '用户管理',
      role: 'USER',
      children: [
        {
          key: '/user/useraddress',
          label: '用户地址管理',
          role: 'USER',
        }
      ],
    }
  ],

  // finance顶级菜单
  finance: [
    {
      key: '流水管理',
      label: '流水管理',
      role: 'ADMIN',
      children: [
        {
          key: '/admin/financial-flow',
          label: '资金流水',
          role: 'ADMIN',
        }
      ],
    }
  ],
};

// 使用示例：
// 在ThreeLevelLayout.tsx中导入并使用：
// import { generatedMenuData, generatedTopMenuItems } from './menu-integration';
// 
// 然后在menuData对象中合并：
// const menuData = {
//   ...generatedMenuData,
//   // 原有的菜单配置
//   products: [
//     ...generatedMenuData.products || [],
//     // 原有的商品菜单项
//   ],
//   orders: [
//     ...generatedMenuData.orders || [],
//     // 原有的订单菜单项
//   ]
// };
// 
// 顶级菜单配置：
// const topMenuItems = [
//   ...generatedTopMenuItems,
//   // 原有的顶级菜单项
// ].filter(item => {
//   // 权限过滤逻辑
// });

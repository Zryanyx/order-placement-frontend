import { ReactNode } from 'react'
import { UnorderedListOutlined } from '@ant-design/icons'

interface MenuItem {
  key: string
  label: string
  icon?: ReactNode
  children?: MenuItem[]
  onClick?: () => void
  role?: string
}

export const generatedTopMenuItems = [
  { key: 'products', label: '商品', icon: <UnorderedListOutlined />, role: 'ADMIN' },
  { key: 'user', label: '用户', icon: <UnorderedListOutlined />, role: 'ADMIN' }
]

export const generatedMenuData: Record<string, MenuItem[]> = {
  products: [
    {
      key: '商品分类管理',
      label: '商品分类管理',
      role: 'ADMIN',
      children: [
        { key: '/admin/category', label: '商品分类列表', role: 'ADMIN' }
      ]
    }
  ],

  user: [
    {
      key: '用户地址管理',
      label: '用户地址管理',
      role: 'ADMIN',
      children: [
        { key: '/admin/user-addresses', label: '用户地址列表', role: 'ADMIN' }
      ]
    }
  ]
}

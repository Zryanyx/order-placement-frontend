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

]

export const generatedMenuData: Record<string, MenuItem[]> = {
 
}

// 用户模型
export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'USER';
  status: 0 | 1;  // 0:禁用, 1:启用
  avatar?: string;
  lastLoginTime?: string;
  createdTime: string;
  updatedTime: string;
}

// 商品模型
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: 0 | 1;  // 0:下架, 1:上架
  createdTime: string;
  updatedTime?: string;
}

// 订单模型
export interface Order {
  id: number;
  orderNo: string;
  userId: number;
  totalAmount: number;
  status: 'PENDING_PAYMENT' | 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  paymentTime?: string;
  shippingTime?: string;
  completedTime?: string;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  remark?: string;
  createdTime: string;
  updatedTime?: string;
}

// 订单项模型
export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  createdTime: string;
  updatedTime?: string;
}

// 订单完整信息（包含订单详情和订单项列表）
export interface OrderFullInfo {
  order: Order;
  orderItems: OrderItem[];
  totalItems: number;
  totalQuantity: number;
}

// 统一响应格式（已弃用：后端已改为使用 ResponseEntity，不再使用此格式）
// @deprecated 后端现在直接返回数据，HTTP状态码在响应头中
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页响应
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  username: string;
  role: 'ADMIN' | 'USER';
  message: string;
  id?: number; // 用户ID，如果后端返回的话
}

// 注册请求
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

// 创建订单请求
export interface CreateOrderRequest {
  userId: number;
  orderItems: {
    productId: number;
    quantity: number;
  }[];
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  remark?: string;
}

// 购物车项
export interface CartItem {
  product: Product;
  quantity: number;
}

// 商品查询参数
export interface ProductQueryParams {
  pageNum?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
}

// 订单查询参数
export interface OrderQueryParams {
  pageNum?: number;
  pageSize?: number;
  status?: string;
}


export interface Category {
  id: number;
  name: string;
  price: number;
  stock?: number;
  description: string;
  status?: number;
  imageUrl: string;
  createdTime?: string;
  updatedTime?: string;
  deleted?: number;
}

export interface CategoryQueryParams {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
  status?: number;
}

export interface UserAddress {
  id: number;
  userId: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault?: number;
  createdTime?: string;
  updatedTime?: string;
  deleted?: number;
}

export interface UserAddressQueryParams {
  pageNum?: number;
  pageSize?: number;
  userId?: number;
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
  isDefault?: number;
}

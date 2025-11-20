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


export interface Category {
  id: number;
  name: string;
  price: number;
  stock?: number;
  description: string;
  status?: number;
  category: string;
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
  category?: string;
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

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  description: string;
  status?: number;
  createdTime?: string;
  updatedTime?: string;
  deleted?: number;
}

export interface ProductQueryParams {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  price?: number;
  categoryId?: number;
  description?: string;
  status?: number;
  createdTime?: string;
  updatedTime?: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  price: number;
  stock?: number;
  description: string;
  status?: number;
  category: string;
  imageUrl: string;
  createdTime?: string;
  updatedTime?: string;
  deleted?: number;
}

export interface ProductCategoryQueryParams {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
  status?: number;
  category?: string;
  imageUrl?: string;
  createdTime?: string;
  updatedTime?: string;
}

export interface ProductManagement {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  description: string;
  status?: number;
  createdTime?: string;
  updatedTime?: string;
  deleted?: number;
}

export interface ProductManagementQueryParams {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  price?: number;
  categoryId?: number;
  description?: string;
  status?: number;
  createdTime?: string;
  updatedTime?: string;
}

export interface AdminOnlyModule {
  id: number;
  name: string;
}

export interface AdminOnlyModuleQueryParams {
  pageNum?: number;
  pageSize?: number;
  name?: string;
}

export interface UserModule {
  id: number;
  title: string;
}

export interface UserModuleQueryParams {
  pageNum?: number;
  pageSize?: number;
  title?: string;
}

export interface PublicModule {
  id: number;
  content: string;
}

export interface PublicModuleQueryParams {
  pageNum?: number;
  pageSize?: number;
  content?: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  status?: number;
  viewCount?: number;
  likeCount?: number;
  publishTime: string;
  createdTime: string;
  updatedTime: string;
  deleted?: number;
}

export interface ArticleQueryParams {
  pageNum?: number;
  pageSize?: number;
  title?: string;
  author?: string;
  status?: number;
}

export interface Comment {
  id: number;
  userId: number;
  articleId: number;
  content: string;
  parentId?: number;
  likeCount?: number;
  status?: number;
  createdTime: string;
  updatedTime: string;
  deleted?: number;
}

export interface CommentQueryParams {
  pageNum?: number;
  pageSize?: number;
  userId?: number;
  content?: string;
}

export interface SystemConfig {
  id: number;
  configName: string;
  configKey: string;
  configValue: string;
  configType?: number;
  remark: string;
  createdTime: string;
  updatedTime: string;
  deleted?: number;
}

export interface SystemConfigQueryParams {
  pageNum?: number;
  pageSize?: number;
  configName?: string;
  configKey?: string;
}

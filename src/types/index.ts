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








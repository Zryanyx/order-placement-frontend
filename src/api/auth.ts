import request from '@/utils/request';
import { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

// 用户注册
export const register = (data: RegisterRequest) => {
  return request.post<ApiResponse<User>>('/auth/register', data);
};

// 用户登录
export const login = (data: LoginRequest) => {
  return request.post<ApiResponse<LoginResponse>>('/auth/login', data);
};

// 检查用户名
// 注意：根据文档，响应可能是boolean或统一格式，这里假设返回统一格式 {code: 200, data: true/false}
export const checkUsername = async (username: string): Promise<boolean> => {
  try {
    const response = await request.get<ApiResponse<boolean>>(`/auth/check-username?username=${username}`);
    // 如果返回的是统一格式，取data字段
    return response.data.data;
  } catch (error) {
    // 如果请求失败，假设用户名不存在（允许注册）
    return false;
  }
};

// 检查邮箱
// 注意：根据文档，响应可能是boolean或统一格式，这里假设返回统一格式 {code: 200, data: true/false}
export const checkEmail = async (email: string): Promise<boolean> => {
  try {
    const response = await request.get<ApiResponse<boolean>>(`/auth/check-email?email=${email}`);
    // 如果返回的是统一格式，取data字段
    return response.data.data;
  } catch (error) {
    // 如果请求失败，假设邮箱不存在（允许注册）
    return false;
  }
};



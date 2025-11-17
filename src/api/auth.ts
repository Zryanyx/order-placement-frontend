import request from '@/utils/request';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '@/types';

// 用户注册
export const register = (data: RegisterRequest) => {
  return request.post<User>('/user', data);
};

// 用户登录
export const login = (data: LoginRequest) => {
  return request.post<LoginResponse>('/token', data);
};

// 检查用户名
export const checkUsername = async (username: string): Promise<boolean> => {
  try {
    const response = await request.get<boolean>(`/auth/check-username?username=${username}`);
    return response.data;
  } catch (error) {
    // 如果请求失败，假设用户名不存在（允许注册）
    return false;
  }
};

// 检查邮箱
export const checkEmail = async (email: string): Promise<boolean> => {
  try {
    const response = await request.get<boolean>(`/auth/check-email?email=${email}`);
    return response.data;
  } catch (error) {
    // 如果请求失败，假设邮箱不存在（允许注册）
    return false;
  }
};



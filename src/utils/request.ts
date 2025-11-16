import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import { ApiResponse } from '@/types';

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    console.log('LocalStorage Token:', token);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request Headers:', config.headers);
    console.log('Request URL:', config.url);
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse;
    
    // 如果code不是200，说明有错误
    if (res.code !== 200) {
      message.error(res.message || '请求失败');
      
      // 401未授权，清除token并跳转到登录页
      if (res.code === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
      
      // 403权限不足
      if (res.code === 403) {
        message.error('权限不足');
      }
      
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return response;
  },
  (error: AxiosError) => {
    // 网络错误处理
    if (error.message.includes('timeout')) {
      message.error('请求超时，请稍后重试');
    } else if (error.message.includes('Network Error')) {
      message.error('网络错误，请检查网络连接');
    } else {
      message.error(error.message || '请求失败');
    }
    
    // 401未授权
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default request;


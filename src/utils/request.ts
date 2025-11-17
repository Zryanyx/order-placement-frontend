import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

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
    // 后端使用 ResponseEntity，成功时 HTTP 状态码为 200，响应体直接是数据
    // 直接返回响应，让调用方使用 response.data 获取数据
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const errorMessage = (error.response?.data as any)?.message || error.message;
    
    // 根据 HTTP 状态码处理错误
    if (status === 400) {
      message.error(errorMessage || '请求参数错误');
    } else if (status === 401) {
      message.error('未授权，请重新登录');
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    } else if (status === 403) {
      message.error('权限不足');
    } else if (status === 404) {
      message.error('资源不存在');
    } else if (status === 500) {
      message.error('服务器错误，请稍后重试');
    } else if (error.message.includes('timeout')) {
      message.error('请求超时，请稍后重试');
    } else if (error.message.includes('Network Error')) {
      message.error('网络错误，请检查网络连接');
    } else {
      message.error(errorMessage || '请求失败');
    }
    
    return Promise.reject(error);
  }
);

export default request;


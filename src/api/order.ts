import request from '@/utils/request';
import { ApiResponse, Order, OrderItem, CreateOrderRequest, OrderQueryParams, PageResponse } from '@/types';

// 创建订单
export const createOrder = (data: CreateOrderRequest) => {
  return request.post<ApiResponse<Order>>('/orders', data);
};

// 获取用户订单列表（后端通过权限控制自动识别用户）
export const getUserOrders = (params?: OrderQueryParams) => {
  return request.get<ApiResponse<PageResponse<Order>>>('/orders', { params });
};

// 获取所有订单（管理员）
export const getAllOrders = (params?: OrderQueryParams) => {
  return request.get<ApiResponse<PageResponse<Order>>>('/admin/orders', { params });
};

// 获取订单详情
export const getOrderById = (id: number) => {
  return request.get<ApiResponse<Order>>(`/orders/${id}`);
};

// 获取订单项列表
export const getOrderItems = (id: number) => {
  return request.get<ApiResponse<OrderItem[]>>(`/orders/${id}/items`);
};

// 支付订单
export const payOrder = async (id: number) => {
  try {
    console.log('Sending payOrder request for id:', id);
    const response = await request.patch<ApiResponse<null>>(`/orders/${id}`, { status: 'PAID' });
    console.log('payOrder response:', response);
    return response;
  } catch (error: any) {
    console.error('payOrder error:', error.response?.data || error.message || error);
    throw error;
  }
};

// 发货订单（管理员）
export const shipOrder = async (id: number) => {
  try {
    console.log('Sending shipOrder request for id:', id);
    const response = await request.patch<ApiResponse<null>>(`/orders/${id}`, { status: 'SHIPPED' });
    console.log('shipOrder response:', response);
    return response;
  } catch (error: any) {
    console.error('shipOrder error:', error.response?.data || error.message || error);
    throw error;
  }
};

// 完成订单
export const completeOrder = async (id: number) => {
  try {
    console.log('Sending completeOrder request for id:', id);
    const response = await request.patch<ApiResponse<null>>(`/orders/${id}`, { status: 'COMPLETED' });
    console.log('completeOrder response:', response);
    return response;
  } catch (error: any) {
    console.error('completeOrder error:', error.response?.data || error.message || error);
    throw error;
  }
};

// 取消订单
export const cancelOrder = async (id: number) => {
  try {
    console.log('Sending cancelOrder request for id:', id);
    const response = await request.patch<ApiResponse<null>>(`/orders/${id}`, { status: 'CANCELLED' });
    console.log('cancelOrder response:', response);
    return response;
  } catch (error: any) {
    console.error('cancelOrder error:', error.response?.data || error.message || error);
    throw error;
  }
};


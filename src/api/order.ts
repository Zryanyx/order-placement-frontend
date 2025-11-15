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
  return request.get<ApiResponse<PageResponse<Order>>>('/orders/admin/all', { params });
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
export const payOrder = (id: number) => {
  return request.put<ApiResponse<null>>(`/orders/${id}/pay`);
};

// 发货订单（管理员）
export const shipOrder = (id: number) => {
  return request.put<ApiResponse<null>>(`/orders/${id}/ship`);
};

// 完成订单
export const completeOrder = (id: number) => {
  return request.put<ApiResponse<null>>(`/orders/${id}/complete`);
};

// 取消订单
export const cancelOrder = (id: number) => {
  return request.put<ApiResponse<null>>(`/orders/${id}/cancel`);
};


import request from '@/utils/request';
import { Product, ProductQueryParams, PageResponse } from '@/types';

// 获取商品列表
export const getProducts = (params?: ProductQueryParams) => {
  return request.get<PageResponse<Product>>('/products', { params });
};

// 获取商品详情
export const getProductById = (id: number) => {
  return request.get<Product>(`/products/${id}`);
};

// 创建商品（管理员）
export const createProduct = (data: Omit<Product, 'id' | 'createdTime' | 'updatedTime'>) => {
  return request.post<Product>('/products', data);
};

// 更新商品（管理员）
export const updateProduct = (id: number, data: Partial<Product>) => {
  return request.put<Product>(`/products/${id}`, data);
};

// 删除商品（管理员）
export const deleteProduct = (id: number) => {
  return request.delete<void>(`/products/${id}`);
};

// 上架商品（管理员）
export const publishProduct = (id: number) => {
  return request.put<void>(`/products/${id}`, { status: '1' });
};

// 下架商品（管理员）
export const unpublishProduct = (id: number) => {
  return request.put<void>(`/products/${id}`, { status: '0' });
};


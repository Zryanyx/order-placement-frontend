import request from '@/utils/request'
import { Category, CategoryQueryParams, PageResponse } from '@/types'
export const getCategoryList = (params: CategoryQueryParams) => {
  return request.get<PageResponse<Category>>('/category', { params })
}
export const getCategoryById = (id: number) => {
  return request.get<Category>(`/category/${id}`)
}
export const createCategory = (data: Category) => {
  return request.post<Category>('/category', data)
}
export const updateCategory = (id: number, data: Category) => {
  return request.put<Category>(`/category/${id}`, data)
}
export const deleteCategory = (id: number) => {
  return request.delete<void>(`/category/${id}`)
}
import request from '@/utils/request'
import { Category, PageResponse } from '@/types'
export const getCategories = (params) => {
  return request.get<PageResponse<Category>>('/categories', { params })
}
export const getCategoryById = (id) => {
  return request.get<Category>(
      `/categories/${id}`
    )
}
export const createCategory = (data) => {
  return request.post<Category>('/categories', data)
}
export const updateCategory = (id, data) => {
  return request.put<Category>(`/categories/${id}`, data)
}
export const deleteCategory = (id) => {
  return request.delete<void>(`/categories/${id}`)
}
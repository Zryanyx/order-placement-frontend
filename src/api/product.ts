import request from '@/utils/request'
import { Product, ProductQueryParams, PageResponse } from '@/types'
export const getProductList = (params: ProductQueryParams) => {
  return request.get<PageResponse<Product>>('/product', { params })
}
export const getProductById = (id: number) => {
  return request.get<Product>(`/product/${id}`)
}
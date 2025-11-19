import request from '@/utils/request'
import { UserAddress, PageResponse } from '@/types'
export const getUserAddresses = (params) => {
  return request.get<PageResponse<UserAddress>>('/user-addresses', { params })
}
export const getUserAddressById = (id) => {
  return request.get<UserAddress>(
      `/user-addresses/${id}`
    )
}
export const createUserAddress = (data) => {
  return request.post<UserAddress>('/user-addresses', data)
}
export const updateUserAddress = (id, data) => {
  return request.put<UserAddress>(`/user-addresses/${id}`, data)
}
export const deleteUserAddress = (id) => {
  return request.delete<void>(`/user-addresses/${id}`)
}
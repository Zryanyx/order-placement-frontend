import request from '@/utils/request'
import { UserAddress, UserAddressQueryParams, PageResponse } from '@/types'
export const getUserAddressList = (params: UserAddressQueryParams) => {
  return request.get<PageResponse<UserAddress>>('/user-addresses', { params })
}
export const getUserAddressById = (id: number) => {
  return request.get<UserAddress>(
      `/user-addresses/${id}`
    )
}
export const createUserAddress = (data: UserAddress) => {
  return request.post<UserAddress>('/user-addresses', data)
}
export const updateUserAddress = (id: number, data: UserAddress) => {
  return request.put<UserAddress>(`/user-addresses/${id}`, data)
}
export const deleteUserAddress = (id: number) => {
  return request.delete<void>(`/user-addresses/${id}`)
}
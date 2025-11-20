import request from '@/utils/request'
import { UserAddress, UserAddressQueryParams, PageResponse } from '@/types'
export const getUserAddressList = (params: UserAddressQueryParams) => {
  return request.get<PageResponse<UserAddress>>('/useraddress', { params })
}
export const getUserAddressById = (id: number) => {
  return request.get<UserAddress>(`/useraddress/${id}`)
}
export const createUserAddress = (data: UserAddress) => {
  return request.post<UserAddress>('/useraddress', data)
}
export const updateUserAddress = (id: number, data: UserAddress) => {
  return request.put<UserAddress>(`/useraddress/${id}`, data)
}
export const deleteUserAddress = (id: number) => {
  return request.delete<void>(`/useraddress/${id}`)
}
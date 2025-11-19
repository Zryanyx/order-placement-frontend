
export interface Category {
  id: number;
  name: string;
  price: number;
  stock?: number;
  description: string;
  status?: number;
  category: string;
  imageUrl: string;
  createdTime?: string;
  updatedTime?: string;
  deleted?: number;
}

export interface CategoryQueryParams {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  price?: number;
  stock?: number;
  description?: string;
  status?: number;
  category?: string;
}

export interface UserAddress {
  id: number;
  userId: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  isDefault?: number;
  createdTime?: string;
  updatedTime?: string;
  deleted?: number;
}

export interface UserAddressQueryParams {
  pageNum?: number;
  pageSize?: number;
  userId?: number;
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  city?: string;
  district?: string;
  detailAddress?: string;
  isDefault?: number;
}

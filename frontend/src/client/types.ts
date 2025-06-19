// Base types
export interface BaseModel {
  id: string
  created_at?: string
  updated_at?: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  count?: number
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

// Product types
export interface Product extends BaseModel {
  name: string
  descriptions?: string
  link_image?: string
  categories_id: string
}

export interface ProductCreate {
  name: string
  descriptions?: string
  link_image?: string
  categories_id: string
}

export interface ProductUpdate extends Partial<ProductCreate> { }

// Category types
export interface Category extends BaseModel {
  name: string
  name_cat?: string
  description?: string
}

export interface CategoryCreate {
  name: string
  description?: string
}

export interface CategoryUpdate extends Partial<CategoryCreate> { }

// Store types
export interface Store extends BaseModel {
  name?: string
  name_store?: string
  address?: string
  phone?: string
  open_close?: string
}

export interface StoreCreate {
  name: string
  address?: string
  phone?: string
  open_close?: string
}

export interface StoreUpdate extends Partial<StoreCreate> { }

// Customer types
export interface Customer extends BaseModel {
  name?: string
  username: string
  password?: string
  sex?: string
  age?: number
  location?: string
  picture?: string
}

export interface CustomerCreate {
  name?: string
  username: string
  password: string
  sex?: string
  age?: number
  location?: string
  picture?: string
}

export interface CustomerUpdate extends Partial<Omit<CustomerCreate, 'password'>> {
  password?: string
}

// Order types
export interface Order extends BaseModel {
  customer_id: string
  store_id: string
  total_amount?: number
  order_date?: string
}

export interface OrderCreate {
  customer_id: string
  store_id: string
  total_amount?: number
  order_date?: string
}

export interface OrderUpdate extends Partial<OrderCreate> { }

// Variant types
export interface Variant extends BaseModel {
  product_id: string
  beverage_option?: string
  calories?: number
  caffeine_mg?: number
  price?: number
  sales_rank?: number
}

export interface VariantCreate {
  product_id: string
  beverage_option?: string
  calories?: number
  caffeine_mg?: number
  price?: number
  sales_rank?: number
}

export interface VariantUpdate extends Partial<VariantCreate> { }

// Order Detail types
export interface OrderDetail extends BaseModel {
  order_id: string
  variant_id: string
  quantity: number
  rate?: number
  unit_price?: number
  price?: number
}

export interface OrderDetailCreate {
  order_id: string
  variant_id: string
  quantity: number
  unit_price?: number
}

export interface OrderDetailUpdate extends Partial<OrderDetailCreate> { }

// Query parameters
export interface PaginationParams {
  page?: number
  pageSize?: number
  skip?: number
  limit?: number
}

export interface ProductsParams extends PaginationParams {
  category_id?: string
  search?: string
}
export interface CategoriesParams extends PaginationParams {
  search?: string
}

export interface VariantsParams extends PaginationParams {
  product_id?: string
}

export interface CustomersParams extends PaginationParams {
  search?: string
}

export interface OrderDetailsParams extends PaginationParams {
  order_id?: string
}

export interface OrdersParams extends PaginationParams {
  customer_id?: string
  store_id?: string
  search?: string
}

export interface StoresParams extends PaginationParams {
  search?: string
}

// Error types
export interface ApiError {
  message: string
  detail?: string
  status?: number
}

// Auth types (for future use)
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user?: User
}

export interface User {
  id: string
  email: string
  username: string
  is_active: boolean
  is_superuser: boolean
}

// Form types
export interface FormState<T> {
  data: T
  loading: boolean
  error: string | null
}

// Table types
export interface TableColumn<T> {
  key: string
  title: string
  dataIndex?: keyof T
  render?: (value: any, record: T, index: number) => React.ReactNode
  sorter?: boolean
  width?: number | string
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    current: number
    pageSize: number
    total: number
    onChange: (page: number, pageSize: number) => void
  }
  rowKey?: keyof T | ((record: T) => string)
  onRow?: (record: T) => any
}

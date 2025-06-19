import { apiClient } from './api'
import type {
  Product,
  ProductCreate,
  ProductUpdate,
  ProductsParams,
  Category,
  CategoryCreate,
  CategoriesParams,
  CategoryUpdate,
  Store,
  StoreCreate,
  StoreUpdate,
  Customer,
  CustomerCreate,
  CustomerUpdate,
  CustomersParams,
  Order,
  OrderCreate,
  OrderUpdate,
  Variant,
  VariantCreate,
  VariantUpdate,
  VariantsParams,
  OrderDetail,
  OrderDetailCreate,
  OrderDetailUpdate,
  OrderDetailsParams,
  PaginatedResponse,
  OrdersParams,
  StoresParams,
} from './types'

// Products Service
export const productsService = {
  getAll: (params?: ProductsParams) =>
    apiClient.get<PaginatedResponse<Product>>('/products', params),

  getById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`),

  create: (data: ProductCreate) =>
    apiClient.post<Product>('/products', data),

  update: (id: string, data: ProductUpdate) =>
    apiClient.put<Product>(`/products/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/products/${id}`),
}

// Categories Service
export const categoriesService = {
  getAll: (params?: CategoriesParams) =>
    apiClient.get<PaginatedResponse<Category>>('/categories', params),

  getById: (id: string) =>
    apiClient.get<Category>(`/categories/${id}`),

  create: (data: CategoryCreate) =>
    apiClient.post<Category>('/categories', data),

  update: (id: string, data: CategoryUpdate) =>
    apiClient.put<Category>(`/categories/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/categories/${id}`),
}

// Stores Service
export const storesService = {
  getAll: (params?: StoresParams) =>
    apiClient.get<PaginatedResponse<Store>>('/stores', params),

  getById: (id: string) =>
    apiClient.get<Store>(`/stores/${id}`),

  create: (data: StoreCreate) =>
    apiClient.post<Store>('/stores', data),

  update: (id: string, data: StoreUpdate) =>
    apiClient.put<Store>(`/stores/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/stores/${id}`),
}

// Customers Service
export const customersService = {
  getAll: (params?: CustomersParams) =>
    apiClient.get<PaginatedResponse<Customer>>('/customers', params),

  getById: (id: string) =>
    apiClient.get<Customer>(`/customers/${id}`),

  create: (data: CustomerCreate) =>
    apiClient.post<Customer>('/customers', data),

  update: (id: string, data: CustomerUpdate) =>
    apiClient.put<Customer>(`/customers/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/customers/${id}`),
}

// Orders Service
export const ordersService = {
  getAll: (params?: OrdersParams) =>
    apiClient.get<PaginatedResponse<Order>>('/orders', params),

  getById: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`),

  create: (data: OrderCreate) =>
    apiClient.post<Order>('/orders', data),

  update: (id: string, data: OrderUpdate) =>
    apiClient.put<Order>(`/orders/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/orders/${id}`),
}

// Variants Service
export const variantsService = {
  getAll: (params?: VariantsParams) =>
    apiClient.get<PaginatedResponse<Variant>>('/variants', params),

  getByProduct: (productId: string) =>
    apiClient.get<PaginatedResponse<Variant>>('/variants', { product_id: productId }),

  getById: (id: string) =>
    apiClient.get<Variant>(`/variants/${id}`),

  search: (params: { q?: string; skip?: number; limit?: number; product_id?: string; min_price?: number; max_price?: number }) =>
    apiClient.get<PaginatedResponse<Variant>>('/variants/search', params),

  create: (data: VariantCreate) =>
    apiClient.post<Variant>('/variants', data),

  update: (id: string, data: VariantUpdate) =>
    apiClient.put<Variant>(`/variants/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/variants/${id}`),
}

// Order Details Service
export const orderDetailsService = {
  getAll: (params?: OrderDetailsParams) =>
    apiClient.get<PaginatedResponse<OrderDetail>>('/order_details', params),

  getByOrder: (orderId: string) =>
    apiClient.get<PaginatedResponse<OrderDetail>>('/order_details', { order_id: orderId }),

  getById: (id: string) =>
    apiClient.get<OrderDetail>(`/order_details/${id}`),

  create: (data: OrderDetailCreate) =>
    apiClient.post<OrderDetail>('/order_details', data),

  update: (id: string, data: OrderDetailUpdate) =>
    apiClient.put<OrderDetail>(`/order_details/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/order_details/${id}`),
}

// Export all services
export const services = {
  products: productsService,
  categories: categoriesService,
  stores: storesService,
  customers: customersService,
  orders: ordersService,
  variants: variantsService,
  orderDetails: orderDetailsService,
}

export default services

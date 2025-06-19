// Export API client
export { apiClient, default as api } from './api'

// Export services
export { services, default as defaultServices } from './services'
export * from './services'

// Export types
export * from './types'

// Re-export commonly used types
export type {
  Product,
  Category,
  Store,
  Customer,
  Order,
  Variant,
  OrderDetail,
  ApiResponse,
  PaginatedResponse,
  ProductCreate,
  CategoryCreate,
  StoreCreate,
  CustomerCreate,
  OrderCreate,
  VariantCreate,
  OrderDetailCreate,
} from './types'

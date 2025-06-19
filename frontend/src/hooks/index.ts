// Base hooks
export * from './useApi'

// Entity-specific hooks
export * from './useProducts'

// Re-export commonly used hooks
export { useApi, useMutation, usePaginatedApi } from './useApi'
export { 
  useProducts, 
  useProduct, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct,
  useProductManagement 
} from './useProducts'

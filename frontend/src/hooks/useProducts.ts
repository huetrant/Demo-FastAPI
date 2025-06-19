import { useCallback } from 'react'
import { message } from 'antd'
import { useApi, useMutation, usePaginatedApi } from './useApi'
import { productsService } from '../client/services'
import type { Product, ProductCreate, ProductUpdate, ProductsParams } from '../client/types'

// Hook for fetching all products with pagination
export function useProducts(params?: ProductsParams) {
  return usePaginatedApi(
    (page: number, pageSize: number) => 
      productsService.getAll({ ...params, page, pageSize }),
    1,
    10
  )
}

// Hook for fetching a single product
export function useProduct(id: string, options?: { immediate?: boolean }) {
  return useApi(
    () => productsService.getById(id),
    { immediate: options?.immediate ?? true }
  )
}

// Hook for creating a product
export function useCreateProduct(options?: { onSuccess?: () => void }) {
  return useMutation(
    (data: ProductCreate) => productsService.create(data),
    {
      onSuccess: (data) => {
        message.success('Product created successfully')
        options?.onSuccess?.()
      },
      onError: () => {
        message.error('Failed to create product')
      },
    }
  )
}

// Hook for updating a product
export function useUpdateProduct(options?: { onSuccess?: () => void }) {
  return useMutation(
    ({ id, data }: { id: string; data: ProductUpdate }) => 
      productsService.update(id, data),
    {
      onSuccess: () => {
        message.success('Product updated successfully')
        options?.onSuccess?.()
      },
      onError: () => {
        message.error('Failed to update product')
      },
    }
  )
}

// Hook for deleting a product
export function useDeleteProduct(options?: { onSuccess?: () => void }) {
  return useMutation(
    (id: string) => productsService.delete(id),
    {
      onSuccess: () => {
        message.success('Product deleted successfully')
        options?.onSuccess?.()
      },
      onError: () => {
        message.error('Failed to delete product')
      },
    }
  )
}

// Combined hook for product management
export function useProductManagement() {
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const handleCreate = useCallback(async (data: ProductCreate) => {
    return createProduct.mutate(data)
  }, [createProduct])

  const handleUpdate = useCallback(async (id: string, data: ProductUpdate) => {
    return updateProduct.mutate({ id, data })
  }, [updateProduct])

  const handleDelete = useCallback(async (id: string) => {
    return deleteProduct.mutate(id)
  }, [deleteProduct])

  return {
    create: {
      ...createProduct,
      execute: handleCreate,
    },
    update: {
      ...updateProduct,
      execute: handleUpdate,
    },
    delete: {
      ...deleteProduct,
      execute: handleDelete,
    },
    loading: createProduct.loading || updateProduct.loading || deleteProduct.loading,
  }
}

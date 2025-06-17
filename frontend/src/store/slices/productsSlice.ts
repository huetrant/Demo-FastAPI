import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { Product } from '../../interfaces'

interface ProductsState {
  items: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  currentProduct: Product | null;
  currentProductLoading: boolean;
}

const initialState: ProductsState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  currentProduct: null,
  currentProductLoading: false,
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {}) => {
    const response = await api.get('/products', {
      params: {
        skip: (page - 1) * pageSize,
        limit: pageSize,
      },
    })
    return response.data
  }
)

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (productId: string) => {
    const response = await api.get(`/products/${productId}`)
    return response.data
  }
)

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (product: Partial<Product> & { categories_id: string }) => {
    const response = await api.post('/products', product)
    return response.data
  }
)

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, ...product }: Partial<Product> & { id: string }) => {
    const response = await api.put(`/products/${id}`, product)
    return response.data
  }
)

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string) => {
    await api.delete(`/products/${id}`)
    return id
  }
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data
        state.total = action.payload.count
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch products'
      })
      .addCase(fetchProduct.pending, (state) => {
        state.currentProductLoading = true
        state.error = null
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentProductLoading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.currentProductLoading = false
        state.error = action.error.message || 'Failed to fetch product'
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create product'
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update product'
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete product'
      })
  }
})

export const { reducer } = productsSlice

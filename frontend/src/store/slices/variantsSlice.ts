import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { Variant } from '../../interfaces'

interface VariantsState {
  items: Variant[];
  loading: boolean;
  error: string | null;
}

const initialState: VariantsState = {
  items: [],
  loading: false,
  error: null
}

export const fetchVariants = createAsyncThunk(
  'variants/fetchVariants',
  async (productId?: string) => {
    const url = productId ? `/variants?product_id=${productId}` : '/variants'
    console.log('Fetching variants from URL:', url)
    const response = await api.get(url)
    console.log('Variants API response:', response.data)
    console.log('Variants data array:', response.data.data)
    return response.data
  }
)

export const fetchVariantsByProduct = createAsyncThunk(
  'variants/fetchVariantsByProduct',
  async (productId: string) => {
    const response = await api.get(`/variants?product_id=${productId}`)
    return response.data
  }
)

export const createVariant = createAsyncThunk(
  'variants/createVariant',
  async (variant: Partial<Variant>) => {
    const response = await api.post('/variants', variant)
    return response.data
  }
)

export const updateVariant = createAsyncThunk(
  'variants/updateVariant',
  async ({ id, ...variant }: Partial<Variant> & { id: string }) => {
    const response = await api.put(`/variants/${id}`, variant)
    return response.data
  }
)

export const deleteVariant = createAsyncThunk(
  'variants/deleteVariant',
  async (id: string) => {
    await api.delete(`/variants/${id}`)
    return id
  }
)

const variantsSlice = createSlice({
  name: 'variants',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVariants.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVariants.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || action.payload
      })
      .addCase(fetchVariants.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch variants'
      })
      .addCase(fetchVariantsByProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVariantsByProduct.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || action.payload
      })
      .addCase(fetchVariantsByProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch variants'
      })
      .addCase(createVariant.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(updateVariant.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteVariant.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload)
      })
  }
})

export const { reducer } = variantsSlice

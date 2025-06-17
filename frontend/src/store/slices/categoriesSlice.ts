import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { Category } from '../../interfaces'

interface CategoriesState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  items: [],
  loading: false,
  error: null
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const response = await api.get('/categories')
    // Transform name_cat to name for frontend
    const transformedData = {
      ...response.data,
      data: response.data.data?.map((category: any) => ({
        ...category,
        name: category.name_cat || category.name
      })) || []
    }
    return transformedData
  }
)

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (category: Partial<Category>) => {
    // Transform name to name_cat for backend
    const categoryData = {
      ...category,
      name_cat: category.name,
      name: undefined // Remove name field
    }
    const response = await api.post('/categories', categoryData)
    // Transform response back to frontend format
    return {
      ...response.data,
      name: response.data.name_cat || response.data.name
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, ...category }: Partial<Category> & { id: string }) => {
    // Transform name to name_cat for backend
    const categoryData = {
      ...category,
      name_cat: category.name,
      name: undefined // Remove name field
    }
    const response = await api.put(`/categories/${id}`, categoryData)
    // Transform response back to frontend format
    return {
      ...response.data,
      name: response.data.name_cat || response.data.name
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id: string) => {
    await api.delete(`/categories/${id}`)
    return id
  }
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch categories'
      })
      .addCase(createCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create category'
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update category'
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete category'
      })
  }
})

export const { reducer } = categoriesSlice

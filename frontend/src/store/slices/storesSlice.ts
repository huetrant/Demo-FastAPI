import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { Store } from '../../interfaces'

interface StoresState {
  items: Store[];
  loading: boolean;
  error: string | null;
}

const initialState: StoresState = {
  items: [],
  loading: false,
  error: null
}

export const fetchStores = createAsyncThunk(
  'stores/fetchStores',
  async () => {
    const response = await api.get('/stores')
    console.log('Stores API response:', response.data)
    // Transform name_store to name for frontend
    const transformedData = {
      ...response.data,
      data: response.data.data?.map((store: any) => ({
        ...store,
        name: store.name_store || store.name
      })) || []
    }
    console.log('Transformed stores data:', transformedData)
    return transformedData
  }
)

export const createStore = createAsyncThunk(
  'stores/createStore',
  async (store: Partial<Store>) => {
    // Transform name to name_store for backend
    const storeData = {
      ...store,
      name_store: store.name,
      name: undefined
    }
    const response = await api.post('/stores', storeData)
    // Transform response back to frontend format
    return {
      ...response.data,
      name: response.data.name_store || response.data.name
    }
  }
)

export const updateStore = createAsyncThunk(
  'stores/updateStore',
  async ({ id, ...store }: Partial<Store> & { id: string }) => {
    // Transform name to name_store for backend
    const storeData = {
      ...store,
      name_store: store.name,
      name: undefined
    }
    const response = await api.put(`/stores/${id}`, storeData)
    // Transform response back to frontend format
    return {
      ...response.data,
      name: response.data.name_store || response.data.name
    }
  }
)

export const deleteStore = createAsyncThunk(
  'stores/deleteStore',
  async (id: string) => {
    await api.delete(`/stores/${id}`)
    return id
  }
)

const storesSlice = createSlice({
  name: 'stores',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStores.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || action.payload
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch stores'
      })
      .addCase(createStore.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createStore.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createStore.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create store'
      })
      .addCase(updateStore.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateStore.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateStore.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update store'
      })
      .addCase(deleteStore.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteStore.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(deleteStore.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete store'
      })
  }
})

export const { reducer } = storesSlice

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { Order } from '../../interfaces'

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null
}

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    const response = await api.get('/orders')
    console.log('Orders API response:', response.data)
    return response.data
  }
)

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (order: Partial<Order>) => {
    const response = await api.post('/orders', order)
    return response.data
  }
)

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, ...order }: Partial<Order> & { id: string }) => {
    const response = await api.put(`/orders/${id}`, order)
    return response.data
  }
)

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id: string) => {
    await api.delete(`/orders/${id}`)
    return id
  }
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || action.payload
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch orders'
      })
      .addCase(createOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create order'
      })
      .addCase(updateOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update order'
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete order'
      })
  }
})

export const { reducer } = ordersSlice

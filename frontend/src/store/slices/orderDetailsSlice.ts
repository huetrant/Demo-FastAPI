import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { OrderDetail } from '../../interfaces'

interface OrderDetailsState {
  items: OrderDetail[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderDetailsState = {
  items: [],
  loading: false,
  error: null
}

export const fetchOrderDetails = createAsyncThunk(
  'orderDetails/fetchOrderDetails',
  async () => {
    const response = await api.get('/order_details')
    console.log('Order Details API response:', response.data)
    return response.data
  }
)

export const fetchOrderDetailsByOrder = createAsyncThunk(
  'orderDetails/fetchOrderDetailsByOrder',
  async (orderId: string) => {
    const response = await api.get(`/order_details?order_id=${orderId}`)
    console.log('Order Details by Order API response:', response.data)
    return response.data
  }
)

export const createOrderDetail = createAsyncThunk(
  'orderDetails/createOrderDetail',
  async (orderDetail: Partial<OrderDetail>) => {
    const response = await api.post('/order_details', orderDetail)
    return response.data
  }
)

export const updateOrderDetail = createAsyncThunk(
  'orderDetails/updateOrderDetail',
  async ({ id, ...orderDetail }: Partial<OrderDetail> & { id: string }) => {
    const response = await api.put(`/order_details/${id}`, orderDetail)
    return response.data
  }
)

export const deleteOrderDetail = createAsyncThunk(
  'orderDetails/deleteOrderDetail',
  async (id: string) => {
    await api.delete(`/order_details/${id}`)
    return id
  }
)

const orderDetailsSlice = createSlice({
  name: 'orderDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || action.payload
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch order details'
      })
      .addCase(fetchOrderDetailsByOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchOrderDetailsByOrder.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || action.payload
      })
      .addCase(fetchOrderDetailsByOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch order details'
      })
      .addCase(createOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create order detail'
      })
      .addCase(updateOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update order detail'
      })
      .addCase(deleteOrderDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteOrderDetail.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(deleteOrderDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete order detail'
      })
  }
})

export const { reducer } = orderDetailsSlice

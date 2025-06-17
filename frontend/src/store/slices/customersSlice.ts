import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'
import { Customer } from '../../interfaces'

interface CustomersState {
  items: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomersState = {
  items: [],
  loading: false,
  error: null
}

export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async () => {
    const response = await api.get('/customers')
    console.log('Customers API response:', response.data)
    return response.data
  }
)

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customer: Partial<Customer>) => {
    const response = await api.post('/customers', customer)
    return response.data
  }
)

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, ...customer }: Partial<Customer> & { id: string }) => {
    const response = await api.put(`/customers/${id}`, customer)
    return response.data
  }
)

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id: string) => {
    await api.delete(`/customers/${id}`)
    return id
  }
)

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.data || action.payload
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch customers'
      })
      .addCase(createCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create customer'
      })
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update customer'
      })
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete customer'
      })
  }
})

export const { reducer } = customersSlice

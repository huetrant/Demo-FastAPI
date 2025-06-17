import { configureStore } from '@reduxjs/toolkit'
import { reducer as categoriesReducer } from './slices/categoriesSlice'
import { reducer as productsReducer } from './slices/productsSlice'
import { reducer as customersReducer } from './slices/customersSlice'
import { reducer as ordersReducer } from './slices/ordersSlice'
import { reducer as storesReducer } from './slices/storesSlice'
import { reducer as variantsReducer } from './slices/variantsSlice'
import { reducer as orderDetailsReducer } from './slices/orderDetailsSlice'

const store = configureStore({
  reducer: {
    categories: categoriesReducer,
    products: productsReducer,
    customers: customersReducer,
    orders: ordersReducer,
    stores: storesReducer,
    variants: variantsReducer,
    orderDetails: orderDetailsReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store

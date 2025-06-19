import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Import pages
import Dashboard from '../pages/Dashboard'
import Products from '../pages/Products'
import ProductDetail from '../pages/ProductDetail'
import Categories from '../pages/Categories'
import Orders from '../pages/Orders'
import OrderDetail from '../pages/OrderDetail'
import Customers from '../pages/Customers'
import Stores from '../pages/Stores'

// Route configuration
export const routes = [
  {
    path: '/',
    element: <Dashboard />,
    title: 'Dashboard',
  },
  {
    path: '/products',
    element: <Products />,
    title: 'Products',
  },
  {
    path: '/products/:productId',
    element: <ProductDetail />,
    title: 'Product Details',
  },
  {
    path: '/categories',
    element: <Categories />,
    title: 'Categories',
  },
  {
    path: '/orders',
    element: <Orders />,
    title: 'Orders',
  },
  {
    path: '/orders/:orderId',
    element: <OrderDetail />,
    title: 'Order Details',
  },
  {
    path: '/customers',
    element: <Customers />,
    title: 'Customers',
  },
  {
    path: '/stores',
    element: <Stores />,
    title: 'Stores',
  },
]

// Main router component
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
      {/* Redirect any unknown routes to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes

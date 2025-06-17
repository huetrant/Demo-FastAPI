import { Layout } from 'antd'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Categories from './pages/Categories'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Customers from './pages/Customers'
import Stores from './pages/Stores'

const { Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:productId" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderDetail />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/stores" element={<Stores />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App

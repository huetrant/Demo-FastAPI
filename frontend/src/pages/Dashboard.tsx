import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../store/slices/productsSlice'
import { fetchCategories } from '../store/slices/categoriesSlice'
import { fetchOrders } from '../store/slices/ordersSlice'
import { fetchCustomers } from '../store/slices/customersSlice'
import { fetchStores } from '../store/slices/storesSlice'
import type { RootState, AppDispatch } from '../store'
import { Card, Row, Col, Spin, Alert, Typography, Statistic } from 'antd'
import {
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShopOutlined,
  RiseOutlined,
  DollarOutlined
} from '@ant-design/icons'

const { Title } = Typography

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { items: products, total: productsTotal, loading: productsLoading, error: productsError } = useSelector((state: RootState) => state.products)
  const { items: categories, loading: categoriesLoading, error: categoriesError } = useSelector((state: RootState) => state.categories)
  const { items: orders, loading: ordersLoading, error: ordersError } = useSelector((state: RootState) => state.orders)
  const { items: customers, loading: customersLoading, error: customersError } = useSelector((state: RootState) => state.customers)
  const { items: stores, loading: storesLoading, error: storesError } = useSelector((state: RootState) => state.stores)

  useEffect(() => {
    // Fetch all data for dashboard
    dispatch(fetchProducts({ page: 1, pageSize: 1000 })) // Fetch all products
    dispatch(fetchCategories())
    dispatch(fetchOrders())
    dispatch(fetchCustomers())
    dispatch(fetchStores())
  }, [dispatch])

  const isLoading = productsLoading || categoriesLoading || ordersLoading || customersLoading || storesLoading
  const hasError = productsError || categoriesError || ordersError || customersError || storesError

  if (isLoading) return (
    <Spin tip="Loading dashboard...">
      <div style={{ textAlign: 'center', padding: '50px', minHeight: '200px' }} />
    </Spin>
  )

  if (hasError) return (
    <Alert
      message="Error"
      description="Failed to load dashboard data"
      type="error"
      showIcon
    />
  )

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

  const statsData = [
    {
      title: 'Total Products',
      value: productsTotal || products.length,
      icon: <ShoppingOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
      path: '/products'
    },
    {
      title: 'Categories',
      value: categories.length,
      icon: <AppstoreOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
      path: '/categories'
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: <ShoppingCartOutlined style={{ color: '#fa8c16' }} />,
      color: '#fa8c16',
      path: '/orders'
    },
    {
      title: 'Customers',
      value: customers.length,
      icon: <UserOutlined style={{ color: '#eb2f96' }} />,
      color: '#eb2f96',
      path: '/customers'
    },
    {
      title: 'Stores',
      value: stores.length,
      icon: <ShopOutlined style={{ color: '#722ed1' }} />,
      color: '#722ed1',
      path: '/stores'
    },
    {
      title: 'Total Revenue',
      value: totalRevenue,
      prefix: '$',
      precision: 2,
      icon: <DollarOutlined style={{ color: '#13c2c2' }} />,
      color: '#13c2c2'
    },
    {
      title: 'Avg Order Value',
      value: avgOrderValue,
      prefix: '$',
      precision: 2,
      icon: <RiseOutlined style={{ color: '#f5222d' }} />,
      color: '#f5222d'
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Dashboard</Title>
      </div>

      <Row gutter={[16, 16]}>
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={6} key={index}>
            <Card
              hoverable={!!stat.path}
              onClick={() => stat.path && navigate(stat.path)}
              style={{
                borderLeft: `4px solid ${stat.color}`,
                cursor: stat.path ? 'pointer' : 'default'
              }}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                precision={stat.precision}
                valueStyle={{ color: stat.color }}
                suffix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Quick Actions" style={{ textAlign: 'center' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card
                  hoverable
                  onClick={() => navigate('/products')}
                  style={{ cursor: 'pointer' }}
                >
                  <ShoppingOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                  <div style={{ marginTop: 8 }}>Manage Products</div>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  hoverable
                  onClick={() => navigate('/orders')}
                  style={{ cursor: 'pointer' }}
                >
                  <ShoppingCartOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
                  <div style={{ marginTop: 8 }}>View Orders</div>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  hoverable
                  onClick={() => navigate('/customers')}
                  style={{ cursor: 'pointer' }}
                >
                  <UserOutlined style={{ fontSize: 24, color: '#eb2f96' }} />
                  <div style={{ marginTop: 8 }}>Manage Customers</div>
                </Card>
              </Col>
              <Col span={6}>
                <Card
                  hoverable
                  onClick={() => navigate('/stores')}
                  style={{ cursor: 'pointer' }}
                >
                  <ShopOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                  <div style={{ marginTop: 8 }}>Manage Stores</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard

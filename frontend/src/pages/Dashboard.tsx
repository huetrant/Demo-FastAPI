import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Statistic } from 'antd'
import {
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShopOutlined,
  RiseOutlined,
  DollarOutlined
} from '@ant-design/icons'
import { LoadingSpinner, ErrorAlert } from '../components'
import { useApi } from '../hooks'
import {
  productsService,
  categoriesService,
  ordersService,
  customersService,
  storesService
} from '../client/services'

const { Title } = Typography

const Dashboard: React.FC = () => {
  const navigate = useNavigate()

  // Fetch all data using new hooks
  const { data: productsResponse, loading: productsLoading, error: productsError } = useApi(
    () => productsService.getAll({ page: 1, pageSize: 1000 }),
    { deps: [] }
  )
  const { data: categoriesResponse, loading: categoriesLoading, error: categoriesError } = useApi(
    () => categoriesService.getAll(),
    { deps: [] }
  )
  const { data: ordersResponse, loading: ordersLoading, error: ordersError } = useApi(
    () => ordersService.getAll(),
    { deps: [] }
  )
  const { data: customersResponse, loading: customersLoading, error: customersError } = useApi(
    () => customersService.getAll(),
    { deps: [] }
  )
  const { data: storesResponse, loading: storesLoading, error: storesError } = useApi(
    () => storesService.getAll(),
    { deps: [] }
  )

  // Extract data from responses
  const products = productsResponse?.data || []
  const productsTotal = productsResponse?.count || products.length
  const categories = categoriesResponse?.data || []
  const orders = ordersResponse?.data || []
  const customers = customersResponse?.data || []
  const stores = storesResponse?.data || []

  // Show loading state
  if (productsLoading || categoriesLoading || ordersLoading || customersLoading || storesLoading) {
    return <LoadingSpinner />
  }

  // Show error state
  if (productsError || categoriesError || ordersError || customersError || storesError) {
    return (<ErrorAlert
      message="Error loading dashboard data"
      description={productsError || categoriesError || ordersError || customersError || storesError || 'Unknown error'}
    />
    )
  }

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

import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShopOutlined
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'

const { Sider } = Layout

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard'
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Products'
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: 'Categories'
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Orders'
    },
    {
      key: '/customers',
      icon: <UserOutlined />,
      label: 'Customers'
    },
    {
      key: '/stores',
      icon: <ShopOutlined />,
      label: 'Stores'
    }
  ]

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      style={{ minHeight: '100vh' }}
    >
      <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  )
}

export default Navbar

import { Layout } from 'antd'
import { Navbar } from './components'
import { AppRoutes } from './routes'

const { Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <AppRoutes />
        </Content>
      </Layout>
    </Layout>
  )
}

export default App

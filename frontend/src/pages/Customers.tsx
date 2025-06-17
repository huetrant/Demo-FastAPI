import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer } from '../store/slices/customersSlice'
import type { RootState, AppDispatch } from '../store'
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Alert,
  Typography,
  message,
  Pagination,
  Tag,
  Avatar,
  InputNumber,
  Select
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, EnvironmentOutlined, ManOutlined, WomanOutlined } from '@ant-design/icons'
import { Customer } from '../interfaces'

const { Title, Text } = Typography
const { confirm } = Modal
const { Option } = Select

const Customers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, error } = useSelector((state: RootState) => state.customers)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchCustomers())
  }, [dispatch])

  const showAddModal = () => {
    setModalMode('add')
    setEditingCustomer(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (customer: Customer) => {
    setModalMode('edit')
    setEditingCustomer(customer)
    form.setFieldsValue({
      name: customer.name,
      sex: customer.sex,
      age: customer.age,
      location: customer.location,
      picture: customer.picture,
      username: customer.username,
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id: string, customerName: string) => {
    confirm({
      title: 'Delete Customer',
      content: `Are you sure you want to delete "${customerName}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await dispatch(deleteCustomer(id)).unwrap()
          dispatch(fetchCustomers())
          message.success('Customer deleted successfully')
        } catch (error) {
          message.error('Failed to delete customer')
        }
      },
    })
  }

  const handleCancel = () => {
    const hasChanges = form.isFieldsTouched()

    if (hasChanges) {
      confirm({
        title: 'Discard Changes',
        content: 'You have unsaved changes. Are you sure you want to close without saving?',
        okText: 'Yes, Discard',
        okType: 'danger',
        cancelText: 'Continue Editing',
        onOk() {
          form.resetFields()
          setIsModalVisible(false)
        },
      })
    } else {
      setIsModalVisible(false)
    }
  }

  const onFinish = async (values: any) => {
    if (modalMode === 'add') {
      // Create: No confirmation needed
      try {
        await dispatch(createCustomer(values)).unwrap()
        setIsModalVisible(false)
        form.resetFields()
        dispatch(fetchCustomers())
        message.success('Customer created successfully')
      } catch (error) {
        message.error('Failed to create customer')
      }
    } else if (modalMode === 'edit' && editingCustomer) {
      // Update: Confirmation needed
      confirm({
        title: 'Update Customer',
        content: `Are you sure you want to update "${values.name || values.username || editingCustomer.name || editingCustomer.username}"?`,
        okText: 'Yes, Update',
        cancelText: 'Cancel',
        async onOk() {
          try {
            await dispatch(updateCustomer({ id: editingCustomer.id, ...values })).unwrap()
            setIsModalVisible(false)
            form.resetFields()
            dispatch(fetchCustomers())
            message.success('Customer updated successfully')
          } catch (error) {
            message.error('Failed to update customer')
          }
        },
      })
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin tip="Loading customers...">
        <div style={{ minHeight: '200px' }} />
      </Spin>
    </div>
  )

  if (error) return <Alert message="Error" description={error} type="error" showIcon />

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentItems = Array.isArray(items) ? items.slice(startIndex, endIndex) : []

  console.log('Customers items:', items)
  console.log('Current items:', currentItems)

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Customers</Title>
        <Text type="secondary">Manage customer information and profiles</Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Customer
        </Button>
      </div>

      {currentItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="secondary">No customers found. Click "Add Customer" to create your first customer.</Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {currentItems.map((item: Customer) => (
            <Col key={item.id} span={6}>
              <Card
                size="small"
                style={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                }}
                hoverable
                actions={[
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      showEditModal(item)
                    }}
                  >
                    Edit
                  </Button>,
                  <Button
                    type="link"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(item.id, item.name || item.username || 'Customer')
                    }}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Avatar
                    size={64}
                    src={item.picture}
                    icon={<UserOutlined />}
                    style={{ marginBottom: '16px' }}
                  />
                  <Card.Meta
                    title={<div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>{item.name || item.username || 'Unnamed Customer'}</div>}
                    description={
                      <div style={{ textAlign: 'left' }}>
                        {item.sex && (
                          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                            {item.sex === 'male' ? <ManOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> : <WomanOutlined style={{ marginRight: '8px', color: '#ff69b4' }} />}
                            <Tag color={item.sex === 'male' ? 'blue' : 'pink'}>{item.sex}</Tag>
                          </div>
                        )}
                        {item.age && (
                          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                            <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <span style={{ fontSize: '12px' }}>{item.age} years old</span>
                          </div>
                        )}
                        {item.location && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <span style={{ fontSize: '12px' }}>{item.location}</span>
                          </div>
                        )}
                        {item.username && (
                          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: '#666' }}>@{item.username}</span>
                          </div>
                        )}
                      </div>
                    }
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {items.length > pageSize && (
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={items.length}
          onChange={page => setCurrentPage(page)}
          style={{ marginTop: 24, textAlign: 'center' }}
          showSizeChanger={false}
          showQuickJumper
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} customers`}
        />
      )}

      <Modal
        title={modalMode === 'add' ? 'Add Customer' : 'Edit Customer'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={modalMode === 'add' ? 'Add' : 'Update'}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ name: '', sex: '', age: null, location: '', picture: '', username: '', password: '' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please input the customer name!' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please input the username!' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sex"
                label="Gender"
              >
                <Select placeholder="Select gender">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="age"
                label="Age"
              >
                <InputNumber min={1} max={120} placeholder="Enter age" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="Enter location" />
          </Form.Item>

          <Form.Item
            name="picture"
            label="Profile Picture URL"
          >
            <Input placeholder="Enter profile picture URL" />
          </Form.Item>

          {modalMode === 'add' && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please input the password!' },
                { min: 8, message: 'Password must be at least 8 characters!' }
              ]}
            >
              <Input.Password placeholder="Enter password (min 8 characters)" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  )
}

export default Customers

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchStores, createStore, updateStore, deleteStore } from '../store/slices/storesSlice'
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
  Tag
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ShopOutlined, PhoneOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { Store } from '../interfaces'

const { Title, Text } = Typography
const { confirm } = Modal

const Stores: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, error } = useSelector((state: RootState) => state.stores)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingStore, setEditingStore] = useState<Store | null>(null)

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchStores())
  }, [dispatch])

  const showAddModal = () => {
    setModalMode('add')
    setEditingStore(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (store: Store) => {
    setModalMode('edit')
    setEditingStore(store)
    form.setFieldsValue({
      name: store.name || store.name_store,
      address: store.address,
      phone: store.phone,
      open_close: store.open_close,
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id: string, storeName: string) => {
    confirm({
      title: 'Delete Store',
      content: `Are you sure you want to delete "${storeName}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await dispatch(deleteStore(id)).unwrap()
          dispatch(fetchStores())
          message.success('Store deleted successfully')
        } catch (error) {
          message.error('Failed to delete store')
        }
      },
    })
  }

  const handleCancel = () => {
    form.resetFields()
    setIsModalVisible(false)
  }

  const onFinish = async (values: any) => {
    if (modalMode === 'add') {
      // Create: No confirmation needed
      try {
        await dispatch(createStore(values)).unwrap()
        setIsModalVisible(false)
        form.resetFields()
        dispatch(fetchStores())
        message.success('Store created successfully')
      } catch (error) {
        message.error('Failed to create store')
      }
    } else if (modalMode === 'edit' && editingStore) {
      // Update: Confirmation needed
      confirm({
        title: 'Update Store',
        content: `Are you sure you want to update "${values.name || editingStore.name || editingStore.name_store}"?`,
        okText: 'Yes, Update',
        cancelText: 'Cancel',
        async onOk() {
          try {
            await dispatch(updateStore({ id: editingStore.id, ...values })).unwrap()
            setIsModalVisible(false)
            form.resetFields()
            dispatch(fetchStores())
            message.success('Store updated successfully')
          } catch (error) {
            message.error('Failed to update store')
          }
        },
      })
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin tip="Loading stores...">
        <div style={{ minHeight: '200px' }} />
      </Spin>
    </div>
  )

  if (error) return <Alert message="Error" description={error} type="error" showIcon />

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentItems = Array.isArray(items) ? items.slice(startIndex, endIndex) : []

  console.log('Stores items:', items)
  console.log('Current items:', currentItems)

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Stores</Title>
        <Text type="secondary">Manage store locations and information</Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Store
        </Button>
      </div>

      {currentItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="secondary">No stores found. Click "Add Store" to create your first store.</Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {currentItems.map((item: Store) => (
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
                      handleDelete(item.id, item.name || item.name_store || 'Store')
                    }}
                  >
                    Delete
                  </Button>,
                ]}
              >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <ShopOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                  <Card.Meta
                    title={<div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>{item.name || item.name_store || 'Unnamed Store'}</div>}
                    description={
                      <div style={{ textAlign: 'left' }}>
                        {item.address && (
                          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                            <EnvironmentOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <span style={{ fontSize: '12px' }}>{item.address}</span>
                          </div>
                        )}
                        {item.phone && (
                          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                            <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <span style={{ fontSize: '12px' }}>{item.phone}</span>
                          </div>
                        )}
                        {item.open_close && (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                            <Tag color="green" style={{ fontSize: '11px' }}>{item.open_close}</Tag>
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
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} stores`}
        />
      )}

      <Modal
        title={modalMode === 'add' ? 'Add Store' : 'Edit Store'}
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
          initialValues={{ name: '', address: '', phone: '', open_close: '' }}
        >
          <Form.Item
            name="name"
            label="Store Name"
            rules={[{ required: true, message: 'Please input the store name!' }]}
          >
            <Input placeholder="Enter store name" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: 'Please input the store address!' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter store address"
              showCount
              maxLength={255}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="open_close"
                label="Operating Hours"
              >
                <Input placeholder="e.g., 9:00 AM - 10:00 PM" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default Stores

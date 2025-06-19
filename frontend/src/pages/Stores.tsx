import React, { useState } from 'react'
import { Button, Modal, Form, Input, Typography, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { 
  LoadingSpinner, 
  ErrorAlert, 
  DataTable,
  showDeleteConfirm, 
  showUpdateConfirm 
} from '../components'
import { useApi, useMutation } from '../hooks'
import { storesService } from '../client/services'
import type { Store, StoreCreate, StoreUpdate, TableColumn } from '../client/types'
import { formatDate, formatId, commonRules } from '../utils'

const { Title, Text } = Typography

const Stores: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingStore, setEditingStore] = useState<Store | null>(null)
  const [form] = Form.useForm()

  // Fetch stores
  const { 
    data: storesResponse, 
    loading, 
    error, 
    execute: refetchStores 
  } = useApi(() => storesService.getAll())

  // Mutations
  const createMutation = useMutation(
    (data: StoreCreate) => storesService.create(data),
    { onSuccess: () => { refetchStores(); setIsModalVisible(false); form.resetFields() } }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: StoreUpdate }) => storesService.update(id, data),
    { onSuccess: () => { refetchStores(); setIsModalVisible(false); form.resetFields() } }
  )

  const deleteMutation = useMutation(
    (id: string) => storesService.delete(id),
    { onSuccess: () => refetchStores() }
  )

  const stores = storesResponse?.data || []

  // Handlers
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

  const handleDelete = (store: Store) => {
    const storeName = store.name || store.name_store || 'this store'
    showDeleteConfirm(storeName, () => deleteMutation.mutate(store.id))
  }

  const handleCancel = () => {
    form.resetFields()
    setIsModalVisible(false)
  }

  const onFinish = async (values: StoreCreate | StoreUpdate) => {
    if (modalMode === 'add') {
      createMutation.mutate(values as StoreCreate)
    } else if (modalMode === 'edit' && editingStore) {
      const storeName = values.name || editingStore.name || editingStore.name_store || 'this store'
      showUpdateConfirm(storeName, () => {
        updateMutation.mutate({ id: editingStore.id, data: values })
      })
    }
  }

  // Table columns
  const columns: TableColumn<Store>[] = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      render: (name: string, record: Store) => name || record.name_store || 'Unnamed Store',
      sorter: true,
    },
    {
      key: 'address',
      title: 'Address',
      dataIndex: 'address',
      render: (address: string) => address || 'No address',
    },
    {
      key: 'phone',
      title: 'Phone',
      dataIndex: 'phone',
      render: (phone: string) => phone || 'No phone',
    },
    {
      key: 'open_close',
      title: 'Hours',
      dataIndex: 'open_close',
      render: (hours: string) => hours || 'No hours specified',
    },
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      render: (id: string) => formatId(id),
      width: 100,
    },
    {
      key: 'created_at',
      title: 'Created',
      dataIndex: 'created_at',
      render: (date: string) => formatDate(date),
      width: 120,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: Store) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
      width: 120,
    },
  ]

  if (loading) return <LoadingSpinner tip="Loading stores..." />
  if (error) return <ErrorAlert description={error} onRetry={refetchStores} />

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Stores</Title>
        <Text type="secondary">Manage store locations and information</Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showAddModal}
          loading={createMutation.loading}
        >
          Add Store
        </Button>
      </div>

      <DataTable
        data={stores}
        columns={columns}
        loading={loading || deleteMutation.loading}
        emptyText="No stores found. Click 'Add Store' to create your first store."
      />

      <Modal
        title={modalMode === 'add' ? 'Add Store' : 'Edit Store'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={modalMode === 'add' ? 'Add' : 'Update'}
        confirmLoading={createMutation.loading || updateMutation.loading}
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
            rules={commonRules.name}
          >
            <Input placeholder="Enter store name" />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Address"
            rules={[{ max: 200, message: 'Address must be less than 200 characters' }]}
          >
            <Input.TextArea 
              rows={2} 
              placeholder="Enter store address"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={commonRules.phone}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="open_close"
            label="Operating Hours"
            rules={[{ max: 100, message: 'Hours must be less than 100 characters' }]}
          >
            <Input placeholder="e.g., 9:00 AM - 10:00 PM" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Stores

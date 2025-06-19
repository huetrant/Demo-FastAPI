import React, { useCallback, useState } from 'react'
import { Button, Modal, Form, Input, Select, InputNumber, Typography, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  LoadingSpinner,
  ErrorAlert,
  DataTable,
  showDeleteConfirm,
  showUpdateConfirm
} from '../components'
import { usePaginatedApi, useMutation } from '../hooks'
import { customersService } from '../client/services'
import type { Customer, CustomerCreate, CustomerUpdate } from '../client/types'
import { formatDate, formatId, commonRules } from '../utils'

const { Title, Text } = Typography
const { Option } = Select

const Customers: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [form] = Form.useForm()

  // Fetch customers with pagination
  const fetchCustomers = useCallback(
    (page: number, size: number) => customersService.getAll({ page, pageSize: size }),
    []
  )
  const {
    data: customers,
    total: totalCustomers,
    page: currentPage,
    pageSize,
    loading: customersLoading,
    error: customersError,
    changePage,
    refresh: refetchCustomers
  } = usePaginatedApi(
    fetchCustomers,
    1,
    9
  )

  // Mutations
  const createMutation = useMutation(
    (data: CustomerCreate) => customersService.create(data),
    { onSuccess: () => { refetchCustomers(); setIsModalVisible(false); form.resetFields() } }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: CustomerUpdate }) => customersService.update(id, data),
    { onSuccess: () => { refetchCustomers(); setIsModalVisible(false); form.resetFields() } }
  )

  const deleteMutation = useMutation(
    (id: string) => customersService.delete(id),
    { onSuccess: () => refetchCustomers() }
  )

  // Handlers
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
      username: customer.username,
      sex: customer.sex,
      age: customer.age,
      location: customer.location,
      picture: customer.picture,
    })
    setIsModalVisible(true)
  }

  const handleDelete = (customer: Customer) => {
    const customerName = customer.name || customer.username || 'this customer'
    showDeleteConfirm(customerName, () => { void deleteMutation.mutate(customer.id) })
  }

  const handleCancel = () => {
    form.resetFields()
    setIsModalVisible(false)
  }

  const onFinish = (values: CustomerCreate | CustomerUpdate) => {
    if (modalMode === 'add') {
      createMutation.mutate(values as CustomerCreate)
    } else if (modalMode === 'edit' && editingCustomer) {
      const customerName = values.name || values.username || editingCustomer.name || editingCustomer.username || 'this customer'
      void showUpdateConfirm(customerName, () => {
        updateMutation.mutate({ id: editingCustomer.id, data: values })
      })
    }
  }

  if (customersLoading) return <LoadingSpinner tip="Loading customers..." />
  if (customersError) return <ErrorAlert description={customersError} onRetry={refetchCustomers} />

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Customers</Title>
        <Text type="secondary">Manage customer accounts and information</Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
          loading={createMutation.loading}
        >
          Add Customer
        </Button>
      </div>

      <DataTable
        data={customers}
        columns={[
          {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
            render: (name: string, record: Customer) => name || record.username || 'No name',
            sorter: true,
          },
          {
            key: 'username',
            title: 'Username',
            dataIndex: 'username',
            sorter: true,
          },
          {
            key: 'sex',
            title: 'Gender',
            dataIndex: 'sex',
            render: (sex: string) => sex ? sex.charAt(0).toUpperCase() + sex.slice(1) : 'Not specified',
          },
          {
            key: 'age',
            title: 'Age',
            dataIndex: 'age',
            render: (age: number) => age || 'Not specified',
            sorter: true,
          },
          {
            key: 'location',
            title: 'Location',
            dataIndex: 'location',
            render: (location: string) => location || 'Not specified',
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
            render: (_, record: Customer) => (
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
        ]}
        loading={customersLoading || deleteMutation.loading}
        emptyText="No customers found. Click 'Add Customer' to create your first customer."
      />

      {totalCustomers > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
          <Button
            disabled={currentPage === 1}
            onClick={() => changePage(currentPage - 1, pageSize)}
          >
            Previous
          </Button>
          <span style={{ margin: '0 16px' }}>
            Page {currentPage} of {Math.ceil(totalCustomers / pageSize)}
          </span>
          <Button
            disabled={currentPage >= Math.ceil(totalCustomers / pageSize)}
            onClick={() => changePage(currentPage + 1, pageSize)}
          >
            Next
          </Button>
          <Select
            value={pageSize}
            onChange={(value) => changePage(1, value)}
            style={{ width: 120, marginLeft: 16 }}
          >
            <Option value={9}>9 / page</Option>
            <Option value={18}>18 / page</Option>
            <Option value={27}>27 / page</Option>
            <Option value={36}>36 / page</Option>
          </Select>
          <span style={{ marginLeft: 16, color: '#999' }}>Total: {totalCustomers}</span>
        </div>
      )}

      <Modal
        title={modalMode === 'add' ? 'Add Customer' : 'Edit Customer'}
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
          initialValues={{ name: '', username: '', sex: '', age: undefined, location: '', picture: '' }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ max: 100, message: 'Name must be less than 100 characters' }]}
          >
            <Input placeholder="Enter customer full name" />
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={commonRules.username}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          {modalMode === 'add' && (
            <Form.Item
              name="password"
              label="Password"
              rules={commonRules.password}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item
            name="sex"
            label="Gender"
          >
            <Select placeholder="Select gender" allowClear>
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="age"
            label="Age"
            rules={[
              { type: 'number', min: 1, max: 120, message: 'Age must be between 1 and 120' }
            ]}
          >
            <InputNumber
              placeholder="Enter age"
              style={{ width: '100%' }}
              min={1}
              max={120}
            />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ max: 200, message: 'Location must be less than 200 characters' }]}
          >
            <Input placeholder="Enter location" />
          </Form.Item>

          <Form.Item
            name="picture"
            label="Profile Picture URL"
            rules={commonRules.url}
          >
            <Input placeholder="Enter profile picture URL (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Customers

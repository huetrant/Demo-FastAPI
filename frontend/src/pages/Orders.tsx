import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchOrders, createOrder, updateOrder, deleteOrder } from '../store/slices/ordersSlice'
import { fetchCustomers } from '../store/slices/customersSlice'
import { fetchStores } from '../store/slices/storesSlice'
import type { RootState, AppDispatch } from '../store'
import {
  Table,
  Button,
  Modal,
  Form,
  Spin,
  Alert,
  Typography,
  message,
  Space,
  Select,
  DatePicker,
  InputNumber
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { Order } from '../interfaces'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { confirm } = Modal
const { Option } = Select

const Orders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { items: orders, loading, error } = useSelector((state: RootState) => state.orders)
  const { items: customers } = useSelector((state: RootState) => state.customers)
  const { items: stores } = useSelector((state: RootState) => state.stores)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchOrders())
    dispatch(fetchCustomers())
    dispatch(fetchStores())
  }, [dispatch])

  const showAddModal = () => {
    setModalMode('add')
    setEditingOrder(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (order: Order) => {
    confirm({
      title: 'Edit Order',
      content: `Are you sure you want to edit Order #${order.id}?`,
      okText: 'Yes, Edit',
      cancelText: 'Cancel',
      onOk() {
        setModalMode('edit')
        setEditingOrder(order)
        form.setFieldsValue({
          customer_id: order.customer_id,
          store_id: order.store_id,
          order_date: order.order_date ? dayjs(order.order_date) : null,
          total_amount: order.total_amount,
        })
        setIsModalVisible(true)
      },
    })
  }

  const handleDelete = (id: string) => {
    confirm({
      title: 'Delete Order',
      content: `Are you sure you want to delete Order #${id}? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await dispatch(deleteOrder(id)).unwrap()
          dispatch(fetchOrders())
          message.success('Order deleted successfully')
        } catch (error) {
          message.error('Failed to delete order')
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

  const onFinish = (values: any) => {
    const action = modalMode === 'add' ? 'create' : 'update'
    const orderData = {
      ...values,
      order_date: values.order_date ? values.order_date.format('YYYY-MM-DD') : null
    }

    confirm({
      title: `${modalMode === 'add' ? 'Create' : 'Update'} Order`,
      content: `Are you sure you want to ${action} this order?`,
      okText: `Yes, ${modalMode === 'add' ? 'Create' : 'Update'}`,
      cancelText: 'Cancel',
      async onOk() {
        try {
          if (modalMode === 'add') {
            await dispatch(createOrder(orderData)).unwrap()
          } else if (modalMode === 'edit' && editingOrder) {
            await dispatch(updateOrder({ id: editingOrder.id, ...orderData })).unwrap()
          }

          setIsModalVisible(false)
          form.resetFields()
          dispatch(fetchOrders())
          message.success(`Order ${modalMode === 'add' ? 'created' : 'updated'} successfully`)
        } catch (error) {
          message.error(`Failed to ${action} order`)
        }
      },
    })
  }

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.name || customer?.username || 'Unknown Customer'
  }

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    return store?.name || store?.name_store || 'Unknown Store'
  }

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`)
  }

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_: any, __: any, index: number) => (
        <Text strong>{index + 1}</Text>
      ),
      width: 60,
    },
    {
      title: 'Customer',
      dataIndex: 'customer_id',
      key: 'customer_id',
      render: (customerId: string) => getCustomerName(customerId),
    },
    {
      title: 'Store',
      dataIndex: 'store_id',
      key: 'store_id',
      render: (storeId: string) => getStoreName(storeId),
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : '-',
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => amount ? `$${amount.toFixed(2)}` : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin tip="Loading orders...">
        <div style={{ minHeight: '200px' }} />
      </Spin>
    </div>
  )

  if (error) return <Alert message="Error" description={error} type="error" showIcon />

  console.log('Orders items:', orders)

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Orders</Title>
        <Text type="secondary">Manage customer orders and transactions</Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Order
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={Array.isArray(orders) ? orders : []}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
        }}
        scroll={{ x: 800 }}
        locale={{
          emptyText: 'No orders found. Click "Add Order" to create your first order.'
        }}
        onRow={(record) => ({
          onClick: () => handleOrderClick(record.id),
          style: { cursor: 'pointer' }
        })}
        rowClassName="hover:bg-gray-50"
      />

      <Modal
        title={modalMode === 'add' ? 'Add Order' : 'Edit Order'}
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
          initialValues={{ customer_id: '', store_id: '', order_date: null, total_amount: null }}
        >
          <Form.Item
            name="customer_id"
            label="Customer"
            rules={[{ required: true, message: 'Please select a customer!' }]}
          >
            <Select placeholder="Select a customer" showSearch optionFilterProp="children">
              {customers.map((customer: any) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name || customer.username || 'Unnamed Customer'}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="store_id"
            label="Store"
            rules={[{ required: true, message: 'Please select a store!' }]}
          >
            <Select placeholder="Select a store" showSearch optionFilterProp="children">
              {stores.map((store: any) => (
                <Option key={store.id} value={store.id}>
                  {store.name || store.name_store || 'Unnamed Store'}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="order_date"
            label="Order Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="total_amount"
            label="Total Amount ($)"
            rules={[{ required: true, message: 'Please input the total amount!' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%' }}
              placeholder="Enter total amount"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Orders

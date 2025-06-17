import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchOrderDetailsByOrder, createOrderDetail, updateOrderDetail, deleteOrderDetail } from '../store/slices/orderDetailsSlice'
import { fetchVariants } from '../store/slices/variantsSlice'
import type { RootState, AppDispatch } from '../store'
import {
  Button,
  Modal,
  Form,
  Spin,
  Alert,
  Typography,
  message,
  Table,
  InputNumber,
  Select,
  Space,
  Breadcrumb
} from 'antd'
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { OrderDetail } from '../interfaces'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { confirm } = Modal
const { Option } = Select

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const { items: orderDetails, loading, error } = useSelector((state: RootState) => state.orderDetails)
  const { items: variants, loading: variantsLoading } = useSelector((state: RootState) => state.variants)
  const { items: orders } = useSelector((state: RootState) => state.orders)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingOrderDetail, setEditingOrderDetail] = useState<OrderDetail | null>(null)

  const [form] = Form.useForm()

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderDetailsByOrder(orderId))
    }
  }, [dispatch, orderId])

  // Fetch all variants separately
  useEffect(() => {
    dispatch(fetchVariants()) // Fetch all variants without product filter
  }, [dispatch])

  const currentOrder = orders.find(order => order.id === orderId)

  const showAddModal = () => {
    setModalMode('add')
    setEditingOrderDetail(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (orderDetail: OrderDetail) => {
    confirm({
      title: 'Edit Order Detail',
      content: `Are you sure you want to edit this order detail?`,
      okText: 'Yes, Edit',
      cancelText: 'Cancel',
      onOk() {
        setModalMode('edit')
        setEditingOrderDetail(orderDetail)
        form.setFieldsValue({
          variant_id: orderDetail.variant_id,
          quantity: orderDetail.quantity,
          unit_price: orderDetail.unit_price || orderDetail.price,
        })
        setIsModalVisible(true)
      },
    })
  }

  const handleDelete = (id: string) => {
    confirm({
      title: 'Delete Order Detail',
      content: `Are you sure you want to delete this order detail? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await dispatch(deleteOrderDetail(id)).unwrap()
          if (orderId) {
            dispatch(fetchOrderDetailsByOrder(orderId))
          }
          message.success('Order detail deleted successfully')
        } catch (error) {
          message.error('Failed to delete order detail')
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

    confirm({
      title: `${modalMode === 'add' ? 'Create' : 'Update'} Order Detail`,
      content: `Are you sure you want to ${action} this order detail?`,
      okText: `Yes, ${modalMode === 'add' ? 'Create' : 'Update'}`,
      cancelText: 'Cancel',
      async onOk() {
        try {
          const orderDetailData = { ...values, order_id: orderId }

          if (modalMode === 'add') {
            await dispatch(createOrderDetail(orderDetailData)).unwrap()
          } else if (modalMode === 'edit' && editingOrderDetail) {
            await dispatch(updateOrderDetail({ id: editingOrderDetail.id, ...orderDetailData })).unwrap()
          }

          setIsModalVisible(false)
          form.resetFields()
          if (orderId) {
            dispatch(fetchOrderDetailsByOrder(orderId))
          }
          message.success(`Order detail ${modalMode === 'add' ? 'created' : 'updated'} successfully`)
        } catch (error) {
          message.error(`Failed to ${action} order detail`)
        }
      },
    })
  }

  const getVariantName = (variantId: string) => {
    const variant = variants.find(v => v.id === variantId || v.id.toString() === variantId)

    if (variant) {
      // Try multiple fields for variant name
      const name = variant.beverage_option ||
        `Variant ${variant.id.slice(-8)}`
      return name
    }

    return `Variant ID: ${variantId.slice(-8)}`
  }

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_: any, __: any, index: number) => index + 1,
      width: 50,
    },
    {
      title: 'Variant',
      dataIndex: 'variant_id',
      key: 'variant_id',
      render: (variantId: string) => {
        const variant = variants.find(v => v.id === variantId)

        return (
          <div>
            <div style={{ fontWeight: 500 }}>
              {variant?.beverage_option || 'Unnamed Variant'}
            </div>
            <div style={{ fontSize: '11px', color: '#999' }}>
              ID: {variantId.slice(-8)}
            </div>
            {variant && (
              <div style={{ fontSize: '11px', color: '#666' }}>
                {variant.calories && `${variant.calories} cal`}
                {variant.caffeine_mg && ` • ${variant.caffeine_mg}mg caffeine`}
              </div>
            )}
          </div>
        )
      },
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => quantity || 0,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (unit_price: number, record: OrderDetail) => {
        const price = unit_price || record.price || 0
        return price ? `$${price.toFixed(2)}` : '-'
      },
    },
    {
      title: 'Total',
      key: 'total',
      render: (_: any, record: OrderDetail) => {
        const unitPrice = record.unit_price || record.price || 0
        const total = (record.quantity || 0) * unitPrice
        return `$${total.toFixed(2)}`
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: OrderDetail) => (
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

  if (loading || variantsLoading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin tip="Loading order details...">
        <div style={{ minHeight: '200px' }} />
      </Spin>
    </div>
  )

  if (error) return <Alert message="Error" description={error} type="error" showIcon />

  const totalAmount = orderDetails.reduce((sum, detail) => {
    const unitPrice = detail.unit_price || detail.price || 0
    return sum + ((detail.quantity || 0) * unitPrice)
  }, 0)

  return (
    <>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/orders')}
            style={{ padding: 0 }}
          >
            Orders
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Order Details</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Order Details</Title>
        <Text type="secondary">
          Order Date: {currentOrder?.order_date ? dayjs(currentOrder.order_date).format('MMM DD, YYYY') : 'N/A'}
          {currentOrder?.total_amount && (
            <span style={{ marginLeft: 16 }}>
              Order Total: <strong>${currentOrder.total_amount.toFixed(2)}</strong>
            </span>
          )}
        </Text>

      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Order Detail
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={orderDetails}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} order details`,
        }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={4}>
              <strong>Total Amount:</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <strong>${totalAmount.toFixed(2)}</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} />
          </Table.Summary.Row>
        )}
        locale={{
          emptyText: 'No order details found. Click "Add Order Detail" to add items to this order.'
        }}
      />

      <Modal
        title={modalMode === 'add' ? 'Add Order Detail' : 'Edit Order Detail'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={modalMode === 'add' ? 'Add' : 'Update'}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ variant_id: '', quantity: 1, unit_price: 0 }}
        >
          <Form.Item
            name="variant_id"
            label="Variant"
            rules={[{ required: true, message: 'Please select a variant!' }]}
          >
            <Select placeholder="Select a variant" showSearch optionFilterProp="children">
              {variants.map((variant: any) => (
                <Option key={variant.id} value={variant.id}>
                  {getVariantName(variant.id)}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please input the quantity!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="unit_price"
            label="Unit Price ($)"
            rules={[{ required: true, message: 'Please input the unit price!' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default OrderDetailPage

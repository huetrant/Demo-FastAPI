import React, { useState, useEffect } from 'react'
import { useApi, useMutation } from '../hooks'
import {
  ordersService,
  orderDetailsService,
  variantsService,
  customersService,
  storesService
} from '../client/services'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Input,
  Typography,
  Space,
  Descriptions,
  Tag,
  Statistic,
  Alert
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons'
import {
  LoadingSpinner,
  ErrorAlert,
  DataTable,
  showDeleteConfirm,
  showUpdateConfirm
} from '../components'
import type {
  Order,
  OrderDetail,
  OrderDetailCreate,
  OrderDetailUpdate,
  TableColumn,
  Variant
} from '../client/types'
import { formatDate, formatId, formatCurrency, formatQuantity, commonRules } from '../utils'

const { Title, Text } = Typography
const { Option } = Select

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingOrderDetail, setEditingOrderDetail] = useState<OrderDetail | null>(null)
  const [form] = Form.useForm()

  // Fetch order details (items)
  const {
    data: orderDetailsResponse,
    loading: orderDetailsLoading,
    error: orderDetailsError,
    execute: refetchOrderDetails
  } = useApi(() => orderDetailsService.getByOrder(orderId!), { immediate: !!orderId })

  const orderDetails = orderDetailsResponse?.data || []

  // Mutations for order details
  const createOrderDetailMutation = useMutation(orderDetailsService.create, {
    onSuccess: () => {
      refetchOrderDetails()
    }
  })

  const updateOrderDetailMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => orderDetailsService.update(id, data),
    {
      onSuccess: () => {
        refetchOrderDetails()
      }
    }
  )

  const deleteOrderDetailMutation = useMutation(orderDetailsService.delete, {
    onSuccess: () => {
      refetchOrderDetails()
    }
  })

  // Fetch variants for dropdown using search API with variant ids from orderDetails
  const variantIds = orderDetails.map(od => od.variant_id).filter(Boolean)
  const { data: variantsResponse } = useApi(() =>
    variantsService.search({
      q: variantIds.length > 0 ? undefined : undefined,
      limit: variantIds.length || 100,
      skip: 0,
      // Additional filters can be added if needed
    }),
    { immediate: variantIds.length > 0 }
  )

  const variants = variantsResponse?.data || []

  // Fetch customers and stores for order info
  const { data: customersResponse } = useApi(() => customersService.getAll())
  const { data: storesResponse } = useApi(() => storesService.getAll())

  const customers = customersResponse?.data || []
  const stores = storesResponse?.data || []

  // Helper functions
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.name || customer?.username || 'Unknown Customer'
  }

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    return store?.name || store?.name_store || 'Unknown Store'
  }

  const getVariantInfo = (variantId: string) => {
    if (!variantId) return null

    // Debug detailed variant lookup
    console.group(`🔍 Debugging variant lookup for ID: ${variantId}`)

    // Analyze variant_id being searched
    console.log('� Variant ID Analysis:', {
      raw: variantId,
      type: typeof variantId,
      length: String(variantId).length,
      charCodes: Array.from(String(variantId)).map(char => ({
        char,
        code: char.charCodeAt(0)
      })),
      trimmed: String(variantId).trim(),
      asNumber: Number(variantId),
      isNaN: isNaN(Number(variantId)),
      JSON: JSON.stringify(variantId)
    })

    // Analyze available variants
    console.log('📋 All Available Variants Analysis:')
    variants.forEach((v: Variant, index: number) => {
      console.log(`Variant ${index}:`, {
        raw: v.id,
        type: typeof v.id,
        length: String(v.id).length,
        charCodes: Array.from(String(v.id)).map(char => ({
          char,
          code: char.charCodeAt(0)
        })),
        trimmed: String(v.id).trim(),
        asNumber: Number(v.id),
        isNaN: isNaN(Number(v.id)),
        JSON: JSON.stringify(v.id),
        name: v.beverage_option,
        // Try all comparison methods
        matches: {
          direct: v.id === variantId,
          string: String(v.id) === String(variantId),
          trimmed: String(v.id).trim() === String(variantId).trim(),
          numeric: Number(v.id) === Number(variantId),
          strictEqual: v.id === variantId,
          looseEqual: v.id == variantId
        }
      })
    })

    // Try to find variant with different comparison methods
    let variant = null
    let matchMethod = null

    const comparisons = [
      { name: 'direct', fn: (v: Variant) => v.id === variantId },
      { name: 'loose', fn: (v: Variant) => v.id == variantId },
      { name: 'string', fn: (v: Variant) => String(v.id) === String(variantId) },
      { name: 'trimmed', fn: (v: Variant) => String(v.id).trim() === String(variantId).trim() },
      { name: 'numeric', fn: (v: Variant) => !isNaN(Number(v.id)) && !isNaN(Number(variantId)) && Number(v.id) === Number(variantId) },
      { name: 'toLowerCase', fn: (v: Variant) => String(v.id).toLowerCase() === String(variantId).toLowerCase() },
      { name: 'parseFloat', fn: (v: Variant) => parseFloat(v.id) === parseFloat(variantId) },
      { name: 'parseInt', fn: (v: Variant) => parseInt(v.id) === parseInt(variantId) }
    ]

    for (const comp of comparisons) {
      try {
        variant = variants.find(comp.fn)
        if (variant) {
          matchMethod = comp.name
          console.log(`✅ Found variant using ${matchMethod} comparison:`, variant)
          break
        }
      } catch (error) {
        console.warn(`❌ Error in ${comp.name} comparison:`, error)
      }
    }

    if (!variant) {
      console.error(`❌ No variant found for ID: ${variantId}`)
      console.error('❌ All comparison results:',
        comparisons.map(comp => ({
          method: comp.name,
          found: variants.some(v => {
            try {
              return comp.fn(v)
            } catch {
              return false
            }
          })
        }))
      )
    }

    console.groupEnd()
    return variant
  }

  const calculateTotal = () => {
    return orderDetails.reduce((total, item) => {
      return total + (item.price || 0)
    }, 0)
  }

  const calculateItemCount = () => {
    return orderDetails.reduce((total, item) => {
      return total + (item.quantity || 0)
    }, 0)
  }

  // Helper function để kiểm tra data integrity
  const checkDataIntegrity = () => {
    const missingVariants = orderDetails.filter(item => {
      const variant = getVariantInfo(item.variant_id)
      return !variant
    })

    if (missingVariants.length > 0) {
      console.warn('Found OrderDetails without matching variants:', missingVariants)
      console.warn('Missing variant IDs:', missingVariants.map(item => item.variant_id))

      // Generate SQL query to check database
      const missingIds = missingVariants.map(item => item.variant_id)
      const sqlQuery = `
-- SQL Query to check variant existence in database:
SELECT 
  od.id as order_detail_id,
  od.variant_id as order_detail_variant_id,
  v.id as variant_id,
  v.beverage_option
FROM order_details od
LEFT JOIN variants v ON od.variant_id = v.id
WHERE od.variant_id IN (${missingIds.map(id => `'${id}'`).join(', ')})
ORDER BY od.id;

-- Check if variant_id data type matches:
SELECT 
  DISTINCT 
  od.variant_id,
  typeof(od.variant_id) as od_type,
  v.id as variant_id,
  typeof(v.id) as v_type
FROM order_details od
LEFT JOIN variants v ON CAST(od.variant_id AS TEXT) = CAST(v.id AS TEXT)
WHERE od.variant_id IN (${missingIds.map(id => `'${id}'`).join(', ')});
      `
      console.log('🗃️ SQL Debug Query:', sqlQuery)
    }

    return {
      totalItems: orderDetails.length,
      missingVariants: missingVariants.length,
      validItems: orderDetails.length - missingVariants.length
    }
  }

  // Handlers
  const showAddModal = () => {
    setModalMode('add')
    setEditingOrderDetail(null)
    form.resetFields()
    form.setFieldsValue({ order_id: orderId })
    setIsModalVisible(true)
  }

  const showEditModal = (orderDetail: OrderDetail) => {
    setModalMode('edit')
    setEditingOrderDetail(orderDetail)
    form.setFieldsValue({
      order_id: orderDetail.order_id,
      variant_id: orderDetail.variant_id,
      quantity: orderDetail.quantity,
      unit_price: orderDetail.unit_price,
    })
    setIsModalVisible(true)
  }

  const handleDeleteOrderDetail = (orderDetail: OrderDetail) => {
    const variant = getVariantInfo(orderDetail.variant_id)
    const itemName = variant?.beverage_option || `Item ${formatId(orderDetail.id)}`
    showDeleteConfirm(itemName, (): void => {
      deleteOrderDetailMutation.mutate(orderDetail.id)
    })
  }

  const handleCancel = () => {
    form.resetFields()
    setIsModalVisible(false)
  }

  const onFinish = async (values: any) => {
    const orderDetailData = {
      ...values,
      price: (values.quantity || 0) * (values.unit_price || 0), // Calculate total price
    }

    if (modalMode === 'add') {
      createOrderDetailMutation.mutate(orderDetailData as OrderDetailCreate)
    } else if (modalMode === 'edit' && editingOrderDetail) {
      const variant = getVariantInfo(values.variant_id)
      const itemName = variant?.beverage_option || `Item ${formatId(editingOrderDetail.id)}`
      showUpdateConfirm(itemName, () => {
        updateOrderDetailMutation.mutate({ id: editingOrderDetail.id, data: orderDetailData })
      })
    }
  }

  // Table columns for order details
  const columns: TableColumn<OrderDetail>[] = [
    {
      key: 'variant',
      title: 'Item',
      render: (_, record: OrderDetail) => {
        const variant = getVariantInfo(record.variant_id)
        if (variant) {
          return variant.beverage_option || 'Unnamed Item'
        }
        return (
          <Text type="secondary">
            Unknown Item (ID: {formatId(record.variant_id)})
          </Text>
        )
      },
      sorter: true,
    },
    {
      key: 'quantity',
      title: 'Quantity',
      dataIndex: 'quantity',
      render: (quantity: number) => formatQuantity(quantity),
      sorter: true,
    },
    {
      key: 'unit_price',
      title: 'Unit Price',
      dataIndex: 'unit_price',
      render: (price: number) => price ? formatCurrency(price) : 'Not set',
      sorter: true,
    },
    {
      key: 'price',
      title: 'Total Price',
      dataIndex: 'price',
      render: (price: number) => price ? formatCurrency(price) : 'Not set',
      sorter: true,
    },
    {
      key: 'rate',
      title: 'Rating',
      dataIndex: 'rate',
      render: (rate: number) => rate ? `${rate}/5` : 'Not rated',
    },
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      render: (id: string) => formatId(id),
      width: 100,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: OrderDetail) => (
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
            onClick={() => handleDeleteOrderDetail(record)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
      width: 120,
    },
  ]

  // Thêm khai báo orderLoading và orderError để tránh lỗi undefined
  const {
    data: orderResponse,
    loading: orderLoading,
    error: orderError
  } = useApi(() => ordersService.getById(orderId!), { immediate: !!orderId })

  if (orderLoading || orderDetailsLoading) return <LoadingSpinner tip="Loading order details..." />
  if (orderError) return <ErrorAlert description={orderError} onRetry={() => navigate('/orders')} />
  if (orderDetailsError) return <ErrorAlert description={orderDetailsError} onRetry={() => refetchOrderDetails()} />
  if (!orderResponse) return <ErrorAlert message="Order not found" onRetry={() => navigate('/orders')} />

  const order = orderResponse

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/orders')}
          style={{ marginBottom: 16 }}
        >
          Back to Orders
        </Button>
        <Title level={2}>
          <ShoppingCartOutlined style={{ marginRight: 8 }} />
          Order Details
        </Title>
        <Text type="secondary">Order items and information</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="Order Information">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Customer">
                {getCustomerName(order.customer_id)}
              </Descriptions.Item>
              <Descriptions.Item label="Store">
                {getStoreName(order.store_id)}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {order.order_date ? formatDate(order.order_date) : 'Not set'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color="processing">Processing</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Order ID">
                {formatId(order.id)}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Total Items"
                    value={calculateItemCount()}
                    suffix="items"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total Amount"
                    value={calculateTotal()}
                    precision={2}
                    prefix="$"
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Order Items"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showAddModal}
                loading={createOrderDetailMutation.loading}
              >
                Add Item
              </Button>
            }
          >
            {/* Hiển thị warning nếu có data integrity issues */}
            {orderDetails.length > 0 && variants.length > 0 && (() => {
              const integrity = checkDataIntegrity()
              if (integrity.missingVariants > 0) {
                const missingItems = orderDetails.filter(item => !getVariantInfo(item.variant_id))
                const missingIds = missingItems.map(item => item.variant_id).join(', ')

                return (
                  <Alert
                    message="Data Integrity Warning"
                    description={
                      <div>
                        <p>{integrity.missingVariants}/{integrity.totalItems} items không tìm thấy variant tương ứng.</p>
                        <p><strong>Missing Variant IDs:</strong> {missingIds}</p>
                        <p>Kiểm tra console để xem chi tiết debug information.</p>
                      </div>
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )
              }
              return null
            })()}

            <DataTable
              data={orderDetails}
              columns={columns}
              loading={orderDetailsLoading || deleteOrderDetailMutation.loading}
              emptyText="No items in this order. Click 'Add Item' to add products to this order."
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={modalMode === 'add' ? 'Add Order Item' : 'Edit Order Item'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={modalMode === 'add' ? 'Add' : 'Update'}
        confirmLoading={createOrderDetailMutation.loading || updateOrderDetailMutation.loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            order_id: orderId,
            variant_id: '',
            quantity: 1,
            unit_price: undefined
          }}
        >
          <Form.Item name="order_id" style={{ display: 'none' }}>
            <Input />
          </Form.Item>

          <Form.Item
            name="variant_id"
            label="Product Variant"
            rules={[{ required: true, message: 'Please select a product variant!' }]}
          >
            <Select placeholder="Select a product variant" showSearch optionFilterProp="children">
              {variants.map((variant: Variant) => (
                <Option key={variant.id} value={variant.id}>
                  {variant.beverage_option || 'Default'}
                  {variant.price && ` - ${formatCurrency(variant.price)}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={commonRules.quantity}
              >
                <InputNumber
                  placeholder="1"
                  style={{ width: '100%' }}
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit_price"
                label="Unit Price ($)"
                rules={commonRules.price}
              >
                <InputNumber
                  placeholder="0.00"
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default OrderDetailPage

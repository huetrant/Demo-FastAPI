import React, { useState } from 'react'
import { useApi, useMutation } from '../hooks'
import {
  orderDetailsService,
  variantsService,
  customersService,
  storesService,
  productsService
} from '../client/services'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card, Row, Col, Button, Modal, Form, Select, InputNumber, Input, Typography, Space, Tag, Statistic
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
  OrderDetail,
  OrderDetailCreate,
  OrderDetailUpdate,
  Variant,
  Product,
  TableColumn
} from '../client/types'
import {
  formatId,
  formatCurrency,
  formatQuantity,
  commonRules
} from '../utils'
import {
  CaloriesCell,
  CaffeineCell,
  SugarCell,
  ProteinCell,
  FiberCell,
  SalesRankCell,
  VitaminACell,
  VitaminCCell,
  PriceCell
} from '../utils/colorFormatters'

const { Title, Text } = Typography
const { Option, OptGroup } = Select

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
      setIsModalVisible(false)
      form.resetFields()
    }
  })

  const updateOrderDetailMutation = useMutation(
    ({ id, data }: { id: string; data: OrderDetailUpdate }) => orderDetailsService.update(id, data),
    {
      onSuccess: () => {
        refetchOrderDetails()
        setIsModalVisible(false)
        form.resetFields()
      }
    }
  )

  const deleteOrderDetailMutation = useMutation(orderDetailsService.delete, {
    onSuccess: () => {
      refetchOrderDetails()
    }
  })

  // Fetch variants for dropdown using batch API with variant ids from orderDetails
  const variantIds = orderDetails.map(od => od.variant_id).filter(Boolean)

  // Manage variants with useState and useEffect instead of useApi
  const [variants, setVariants] = useState<Variant[]>([])
  const [variantsLoading, setVariantsLoading] = useState(false)
  const [variantsError, setVariantsError] = useState<string | null>(null)

  // Manage all variants for dropdown
  const [allVariants, setAllVariants] = useState<Variant[]>([])
  const [allVariantsLoading, setAllVariantsLoading] = useState(false)
  const [allVariantsError, setAllVariantsError] = useState<string | null>(null)

  // Manage products state
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState<string | null>(null)

  // Manage all products for dropdown
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [allProductsLoading, setAllProductsLoading] = useState(false)
  const [allProductsError, setAllProductsError] = useState<string | null>(null)

  React.useEffect(() => {
    if (variantIds.length > 0) {
      setVariantsLoading(true)
      setVariantsError(null)

      variantsService.batch({ ids: variantIds })
        .then(response => {
          setVariants(response.data || [])
        })
        .catch(error => {
          setVariantsError(error.message || 'Failed to fetch variants')
          setVariants([])
        })
        .finally(() => {
          setVariantsLoading(false)
        })
    } else {
      setVariants([])
      setVariantsLoading(false)
      setVariantsError(null)
    }
  }, [variantIds.join(',')]) // Use string join for dependency

  // Fetch products based on variants
  React.useEffect(() => {
    if (variants.length > 0) {
      const productIds = [...new Set(variants.map(v => v.product_id).filter(Boolean))]

      if (productIds.length > 0) {
        setProductsLoading(true)
        setProductsError(null)

        // Fetch all products and filter by IDs (since there's no batch API for products)
        productsService.getAll()
          .then(response => {
            const allProducts = response.data?.data || []
            const filteredProducts = allProducts.filter(p => productIds.includes(p.id))
            setProducts(filteredProducts)
          })
          .catch(error => {
            setProductsError(error.message || 'Failed to fetch products')
            setProducts([])
          })
          .finally(() => {
            setProductsLoading(false)
          })
      } else {
        setProducts([])
        setProductsLoading(false)
        setProductsError(null)
      }
    } else {
      setProducts([])
      setProductsLoading(false)
      setProductsError(null)
    }
  }, [variants.length, variants.map(v => v.product_id).join(',')]) // Dependency on variants

  // Fetch all variants for dropdown
  React.useEffect(() => {
    setAllVariantsLoading(true)
    setAllVariantsError(null)

    variantsService.getAll()
      .then(response => {
        const allVariantsData = response.data?.data || []
        setAllVariants(allVariantsData)
      })
      .catch(error => {
        setAllVariantsError(error.message || 'Failed to fetch all variants')
        setAllVariants([])
      })
      .finally(() => {
        setAllVariantsLoading(false)
      })
  }, []) // Run once on component mount

  // Fetch all products for dropdown
  React.useEffect(() => {
    setAllProductsLoading(true)
    setAllProductsError(null)

    productsService.getAll()
      .then(response => {
        const allProductsData = response.data?.data || []
        setAllProducts(allProductsData)
      })
      .catch(error => {
        setAllProductsError(error.message || 'Failed to fetch all products')
        setAllProducts([])
      })
      .finally(() => {
        setAllProductsLoading(false)
      })
  }, []) // Run once on component mount

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
    return variants.find(v => v.id === variantId) || null
  }

  const getProductInfo = (productId: string) => {
    if (!productId) return null
    return products.find(p => p.id === productId) || null
  }

  const getAllProductInfo = (productId: string) => {
    if (!productId) return null
    return allProducts.find(p => p.id === productId) || null
  }

  // Group variants by product for dropdown
  const groupVariantsByProduct = () => {
    const grouped: { [productId: string]: { product: Product | null, variants: Variant[] } } = {}

    allVariants.forEach(variant => {
      const productId = variant.product_id
      const product = getAllProductInfo(productId)

      if (!grouped[productId]) {
        grouped[productId] = {
          product,
          variants: []
        }
      }
      grouped[productId].variants.push(variant)
    })

    return grouped
  }

  // Generate consistent colors for products
  const getProductColor = (productId: string) => {
    const colors = [
      'magenta', 'red', 'volcano', 'orange', 'gold',
      'lime', 'green', 'cyan', 'blue', 'geekblue',
      'purple', 'pink'
    ]

    if (!productId) return 'default'

    // Create a simple hash from productId to get consistent color
    let hash = 0
    for (let i = 0; i < productId.length; i++) {
      hash = productId.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
  }

  const calculateTotal = () => {
    return orderDetails.reduce((total, item) => {
      // Calculate from quantity * unit_price if price is not available or is 0
      const itemTotal = item.price || ((item.quantity || 0) * (item.unit_price || 0))
      return total + itemTotal
    }, 0)
  }

  const calculateItemCount = () => {
    return orderDetails.reduce((total, item) => {
      return total + (item.quantity || 0)
    }, 0)
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
    const itemName = variant?.beverage_option || 'Item'
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
      const itemName = variant?.beverage_option || 'Item'
      showUpdateConfirm(itemName, () => {
        updateOrderDetailMutation.mutate({ id: editingOrderDetail.id, data: orderDetailData as OrderDetailUpdate })
      })
    }
  }

  // Prepare data for table with variant information
  const tableData = orderDetails.map(orderDetail => {
    const variant = getVariantInfo(orderDetail.variant_id)
    const product = variant ? getProductInfo(variant.product_id) : null

    return {
      ...orderDetail,
      variant,
      product,
      itemTotal: orderDetail.price || ((orderDetail.quantity || 0) * (orderDetail.unit_price || 0))
    }
  })

  // Table columns for order details
  const columns: TableColumn<any>[] = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      sorter: true,
      render: (product: Product | null, record: any) => {
        const productName = product?.name || 'Unknown Product'
        const productId = product?.id || record.product?.id
        const color = productId ? getProductColor(productId) : 'default'

        return (
          <Tag color={color} style={{ fontWeight: 'bold' }}>
            {productName}
          </Tag>
        )
      }
    },
    {
      title: 'Beverage Option',
      dataIndex: 'variant',
      key: 'variant',
      width: 150,
      sorter: true,
      render: (variant: Variant | null) => {
        const option = variant?.beverage_option || 'Default'
        return option
      }
    },
    {
      title: 'Calories (cal)',
      dataIndex: 'variant',
      key: 'calories',
      sorter: true,
      render: (variant: Variant | null) => (
        <CaloriesCell calories={variant?.calories} />
      )
    },
    {
      title: 'Caffeine (mg)',
      dataIndex: 'variant',
      key: 'caffeine',
      sorter: true,
      render: (variant: Variant | null) => (
        <CaffeineCell caffeine={variant?.caffeine_mg} />
      )
    },
    {
      title: 'Protein (g)',
      dataIndex: 'variant',
      key: 'protein',
      sorter: true,
      render: (variant: Variant | null) => (
        <ProteinCell protein={variant?.protein_g} />
      )
    },
    {
      title: 'Sugar (g)',
      dataIndex: 'variant',
      key: 'sugar',
      sorter: true,
      render: (variant: Variant | null) => (
        <SugarCell sugar={variant?.sugars_g} />
      )
    },
    {
      title: 'Fiber (g)',
      dataIndex: 'variant',
      key: 'fiber',
      sorter: true,
      render: (variant: Variant | null) => (
        <FiberCell fiber={variant?.dietary_fibre_g} />
      )
    },
    {
      title: 'Vit. A (%)',
      dataIndex: 'variant',
      key: 'vitamin_a',
      sorter: true,
      render: (variant: Variant | null) => (
        <VitaminACell vitaminA={variant?.vitamin_a?.replace('%', '')} />
      )
    },
    {
      title: 'Vit. C (%)',
      dataIndex: 'variant',
      key: 'vitamin_c',
      sorter: true,
      render: (variant: Variant | null) => (
        <VitaminCCell vitaminC={variant?.vitamin_c?.replace('%', '')} />
      )
    },
    {
      title: 'Sales Rank',
      dataIndex: 'variant',
      key: 'sales_rank',
      sorter: true,
      render: (variant: Variant | null) => (
        <SalesRankCell rank={variant?.sales_rank} />
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: true,
      render: (quantity: number) => formatQuantity(quantity)
    },
    {
      title: 'Unit Price (VND)',
      dataIndex: 'unit_price',
      key: 'unit_price',
      sorter: true,
      render: (price: number) => <PriceCell amount={price} />
    },
    {
      title: 'Total (VND)',
      dataIndex: 'itemTotal',
      key: 'itemTotal',
      sorter: true,
      render: (total: number) => <PriceCell amount={total} />
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
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
      )
    }
  ]

  if (orderDetailsLoading || variantsLoading || productsLoading) {
    return <LoadingSpinner />
  }

  if (orderDetailsError) {
    return <ErrorAlert message={orderDetailsError} />
  }



  return (
    <div style={{ padding: '24px' }}>
      <style>
        {`
          .order-detail-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 24px;
            color: white;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
          }
          
          .nutrition-summary {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            border: 1px solid #e9ecef;
          }
        `}
      </style>

      {/* Enhanced Header */}
      <div className="order-detail-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/orders')}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
              >
                Back to Orders
              </Button>
              <Title level={2} style={{ margin: 0, color: 'white' }}>
                🛍️ Order Details
              </Title>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddModal}
              size="large"
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#ff9a9e',
                border: 'none',
                fontWeight: 'bold'
              }}
            >
              Add Item
            </Button>
          </Col>
        </Row>
      </div>

      {/* Enhanced Order Summary */}
      <div className="nutrition-summary">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Statistic
              title="Total Items"
              value={calculateItemCount()}
              prefix={<ShoppingCartOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Total Amount"
              value={calculateTotal()}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Order Items"
              value={orderDetails.length}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Col>
        </Row>
      </div>

      {/* Order Details Table */}
      <Card title={
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
          🍽️ Order Items & Nutrition Information
        </span>
      }>
        <DataTable
          data={tableData}
          columns={columns}
          loading={orderDetailsLoading || variantsLoading || productsLoading}
          pagination={{
            current: 1,
            pageSize: 10,
            total: tableData.length,
            onChange: () => { }
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={modalMode === 'add' ? '➕ Add Order Item' : '✏️ Edit Order Item'}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            quantity: 1,
            unit_price: 0
          }}
        >
          <Form.Item name="order_id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="variant_id"
            label="Product Variant"
            rules={[{ required: true, message: 'Please select a variant' }]}
          >
            <Select
              placeholder="Select a product variant"
              loading={allVariantsLoading || allProductsLoading}
              showSearch
              optionFilterProp="children"
            >
              {Object.entries(groupVariantsByProduct()).map(([productId, { product, variants: productVariants }]) => {
                const productName = product?.name || 'Unknown Product'

                return (
                  <OptGroup key={productId} label={productName}>
                    {productVariants.map((variant: Variant) => (
                      <Option key={variant.id} value={variant.id}>
                        {variant.beverage_option || 'Default'}
                        {variant.calories && ` - ${variant.calories}cal`}
                        {variant.caffeine_mg && ` - ${variant.caffeine_mg}mg`}
                      </Option>
                    ))}
                  </OptGroup>
                )
              })}
            </Select>
          </Form.Item>

          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Enter quantity"
            />
          </Form.Item>

          <Form.Item
            name="unit_price"
            label="Unit Price"
            rules={[{ required: true, message: 'Please enter unit price' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="Enter unit price"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={createOrderDetailMutation.loading || updateOrderDetailMutation.loading}
              >
                {modalMode === 'add' ? 'Add Item' : 'Update Item'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default OrderDetailPage
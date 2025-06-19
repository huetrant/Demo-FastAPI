import React, { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Typography,
  Space,
  Image,
  Descriptions,
  Tag
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import {
  LoadingSpinner,
  ErrorAlert,
  DataTable,
  showDeleteConfirm,
  showUpdateConfirm
} from '../components'
import { useApi, useMutation, usePaginatedApi } from '../hooks'
import {
  productsService,
  variantsService,
  categoriesService
} from '../client/services'
import type {
  Variant,
  VariantCreate,
  VariantUpdate,
  TableColumn
} from '../client/types'
import { formatDate, formatId, formatCurrency, commonRules } from '../utils'

const { Title, Text } = Typography

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)
  const [form] = Form.useForm()

  // Fetch product details
  const productApiCall = useCallback(() => productsService.getById(productId!), [productId])
  const {
    data: product,
    loading: productLoading,
    error: productError
  } = useApi(productApiCall, { immediate: !!productId })

  // Fetch product variants with pagination
  const fetchVariants = useCallback((page: number, size: number) => variantsService.getAll({ page, pageSize: size, product_id: productId }), [productId])
  const {
    data: variants,
    loading: variantsLoading,
    refresh: refetchVariants
  } = usePaginatedApi(fetchVariants, 1, 10)

  // Fetch categories for product info
  const { data: categoriesResponse } = useApi(() => categoriesService.getAll())

  // Mutations
  const createVariantMutation = useMutation(
    (data: VariantCreate) => variantsService.create(data),
    { onSuccess: () => { refetchVariants(); setIsModalVisible(false); form.resetFields() } }
  )

  const updateVariantMutation = useMutation(
    ({ id, data }: { id: string; data: VariantUpdate }) => variantsService.update(id, data),
    { onSuccess: () => { refetchVariants(); setIsModalVisible(false); form.resetFields() } }
  )

  const deleteVariantMutation = useMutation(
    (id: string) => variantsService.delete(id),
    { onSuccess: () => refetchVariants() }
  )

  const categories = categoriesResponse?.data || []

  // Helper functions
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Unknown Category'
  }

  // Handlers
  const showAddModal = () => {
    setModalMode('add')
    setEditingVariant(null)
    form.resetFields()
    form.setFieldsValue({ product_id: productId })
    setIsModalVisible(true)
  }

  const showEditModal = (variant: Variant) => {
    setModalMode('edit')
    setEditingVariant(variant)
    form.setFieldsValue({
      product_id: variant.product_id,
      beverage_option: variant.beverage_option,
      calories: variant.calories,
      caffeine_mg: variant.caffeine_mg,
      price: variant.price,
      sales_rank: variant.sales_rank,
    })
    setIsModalVisible(true)
  }

  const handleDeleteVariant = (variant: Variant) => {
    const variantName = variant.beverage_option || `Variant ${formatId(variant.id)}`
    showDeleteConfirm(variantName, () => {
      void deleteVariantMutation.mutate(variant.id)
    })
  }

  const handleCancel = () => {
    form.resetFields()
    setIsModalVisible(false)
  }

  const onFinish = (values: VariantCreate | VariantUpdate) => {
    if (modalMode === 'add') {
      createVariantMutation.mutate(values as VariantCreate)
    } else if (modalMode === 'edit' && editingVariant) {
      const variantName = values.beverage_option || `Variant ${formatId(editingVariant.id)}`
      showUpdateConfirm(variantName, () => {
        updateVariantMutation.mutate({ id: editingVariant.id, data: values })
      })
    }
  }

  // Table columns for variants
  const columns: TableColumn<Variant>[] = [
    {
      key: 'beverage_option',
      title: 'Option',
      dataIndex: 'beverage_option',
      render: (option: string) => option || 'Default',
      sorter: true,
    },
    {
      key: 'price',
      title: 'Price',
      dataIndex: 'price',
      render: (price: number) => price ? formatCurrency(price) : 'Not set',
      sorter: true,
    },
    {
      key: 'calories',
      title: 'Calories',
      dataIndex: 'calories',
      render: (calories: number) => calories ? `${calories} cal` : 'Not set',
      sorter: true,
    },
    {
      key: 'caffeine_mg',
      title: 'Caffeine',
      dataIndex: 'caffeine_mg',
      render: (caffeine: number) => caffeine ? `${caffeine} mg` : 'Not set',
      sorter: true,
    },
    {
      key: 'sales_rank',
      title: 'Sales Rank',
      dataIndex: 'sales_rank',
      render: (rank: number) => rank ? `#${rank}` : 'Not ranked',
      sorter: true,
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
      render: (_, record: Variant) => (
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
            onClick={() => handleDeleteVariant(record)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
      width: 120,
    },
  ]

  if (productLoading || variantsLoading) return <LoadingSpinner tip="Loading product details..." />
  if (productError) return <ErrorAlert description={productError} onRetry={() => navigate('/products')} />
  if (!product) return <ErrorAlert message="Product not found" onRetry={() => navigate('/products')} />

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/products')}
          style={{ marginBottom: 16 }}
        >
          Back to Products
        </Button>
        <Title level={2}>{product.name}</Title>
        <Text type="secondary">Product details and variants</Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title="Product Information">
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {product.link_image ? (
                <Image
                  src={product.link_image}
                  alt={product.name}
                  style={{ maxWidth: '100%', maxHeight: 300 }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
              ) : (
                <div style={{
                  height: 200,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999'
                }}>
                  No Image
                </div>
              )}
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{product.name}</Descriptions.Item>
              <Descriptions.Item label="Category">
                <Tag color="blue">{getCategoryName(product.categories_id)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {product.descriptions || 'No description'}
              </Descriptions.Item>
              <Descriptions.Item label="Product ID">
                {formatId(product.id)}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {product.created_at ? formatDate(product.created_at) : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Product Variants"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showAddModal}
                loading={createVariantMutation.loading}
              >
                Add Variant
              </Button>
            }
          >
            <DataTable
              data={variants}
              columns={columns}
              loading={variantsLoading || deleteVariantMutation.loading}
              emptyText="No variants found. Click 'Add Variant' to create product variants."
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={modalMode === 'add' ? 'Add Product Variant' : 'Edit Product Variant'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={modalMode === 'add' ? 'Add' : 'Update'}
        confirmLoading={createVariantMutation.loading || updateVariantMutation.loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            product_id: productId,
            beverage_option: '',
            calories: undefined,
            caffeine_mg: undefined,
            price: undefined,
            sales_rank: undefined
          }}
        >
          <Form.Item name="product_id" style={{ display: 'none' }}>
            <Input />
          </Form.Item>

          <Form.Item
            name="beverage_option"
            label="Beverage Option"
            rules={[{ max: 100, message: 'Option name must be less than 100 characters' }]}
          >
            <Input placeholder="e.g., Small, Medium, Large, Decaf, etc." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price ($)"
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
            <Col span={12}>
              <Form.Item
                name="sales_rank"
                label="Sales Rank"
                rules={[{ type: 'number', min: 1, message: 'Sales rank must be positive' }]}
              >
                <InputNumber
                  placeholder="1"
                  style={{ width: '100%' }}
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="calories"
                label="Calories"
                rules={[{ type: 'number', min: 0, message: 'Calories must be positive' }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="caffeine_mg"
                label="Caffeine (mg)"
                rules={[{ type: 'number', min: 0, message: 'Caffeine must be positive' }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: '100%' }}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default ProductDetail

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
  Tag,
  Statistic,
  Divider,
  Badge,
  Avatar
} from 'antd'
import {
  ArrowLeftOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  StarOutlined,
  DollarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  HeartOutlined,
  ExperimentOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import {
  LoadingSpinner,
  ErrorAlert,
  DataTable,
  showDeleteConfirm,
  showUpdateConfirm,
  showError
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
import {
  CaloriesCell,
  CaffeineCell,
  SugarCell,
  ProteinCell,
  FiberCell,
  SalesRankCell,
  PriceCell
} from '../utils/colorFormatters'

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
    error: productError,
    refresh: refetchProduct
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
    {
      onSuccess: () => {
        refetchVariants();
        setIsModalVisible(false);
        form.resetFields()
      },
      onError: (error) => {
        showError('Error creating variant', error.message)
      }
    }
  )

  const updateVariantMutation = useMutation(
    ({ id, data }: { id: string; data: VariantUpdate }) => variantsService.update(id, data),
    {
      onSuccess: () => {
        refetchVariants();
        setIsModalVisible(false);
        form.resetFields()
      },
      onError: (error) => {
        showError('Error updating variant', error.message)
      }
    }
  )

  const deleteVariantMutation = useMutation(
    (id: string) => variantsService.delete(id),
    {
      onSuccess: () => refetchVariants(),
      onError: (error) => {
        showError('Error deleting variant', error.message)
      }
    }
  )

  const categories = categoriesResponse?.data || []

  // Helper functions
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name || 'Unknown Category'
  }

  const getCategoryColor = (categoryId: string) => {
    const colors = ['blue', 'green', 'orange', 'purple', 'red', 'cyan', 'magenta', 'gold']
    const index = categories.findIndex(c => c.id === categoryId)
    return colors[index % colors.length] || 'blue'
  }

  // Calculate statistics
  const variantStats = {
    total: variants.length,
    avgPrice: variants.length > 0 ? variants.reduce((sum, v) => sum + (v.price || 0), 0) / variants.length : 0,
    maxCalories: variants.length > 0 ? Math.max(...variants.map(v => v.calories || 0)) : 0,
    maxCaffeine: variants.length > 0 ? Math.max(...variants.map(v => v.caffeine_mg || 0)) : 0,
    avgProtein: variants.length > 0 ? variants.reduce((sum, v) => sum + (v.protein_g || 0), 0) / variants.length : 0,
    avgFibre: variants.length > 0 ? variants.reduce((sum, v) => sum + (v.dietary_fibre_g || 0), 0) / variants.length : 0
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
      dietary_fibre_g: variant.dietary_fibre_g,
      sugars_g: variant.sugars_g,
      protein_g: variant.protein_g,
      vitamin_a: variant.vitamin_a,
      vitamin_c: variant.vitamin_c,
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
      render: (option: string) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
            {(option || 'D').charAt(0).toUpperCase()}
          </Avatar>
          <Text strong>{option || 'Default'}</Text>
        </Space>
      ),
      sorter: true,
      width: 150,
    },
    {
      key: 'price',
      title: 'Price',
      dataIndex: 'price',
      render: (price: number) => <PriceCell amount={price} />,
      sorter: true,
      width: 120,
    },
    {
      key: 'calories',
      title: 'Calories (cal)',
      dataIndex: 'calories',
      render: (calories: number) => <CaloriesCell calories={calories} />,
      sorter: true,
      width: 110,
    },
    {
      key: 'caffeine_mg',
      title: 'Caffeine (mg)',
      dataIndex: 'caffeine_mg',
      render: (caffeine: number) => <CaffeineCell caffeine={caffeine} />,
      sorter: true,
      width: 110,
    },
    {
      key: 'protein_g',
      title: 'Protein (g)',
      dataIndex: 'protein_g',
      render: (protein: number) => <ProteinCell protein={protein} />,
      sorter: true,
      width: 100,
    },
    {
      key: 'dietary_fibre_g',
      title: 'Fibre (g)',
      dataIndex: 'dietary_fibre_g',
      render: (fibre: number) => <FiberCell fiber={fibre} />,
      sorter: true,
      width: 90,
    },
    {
      key: 'sugars_g',
      title: 'Sugars (g)',
      dataIndex: 'sugars_g',
      render: (sugars: number) => <SugarCell sugar={sugars} />,
      sorter: true,
      width: 90,
    },
    {
      key: 'vitamin_a',
      title: 'Vitamin A',
      dataIndex: 'vitamin_a',
      render: (vitaminA: string) => (
        <Space>
          <MedicineBoxOutlined style={{ color: '#f5222d' }} />
          <Text>{vitaminA || 'Not set'}</Text>
        </Space>
      ),
      sorter: true,
      width: 100,
    },
    {
      key: 'vitamin_c',
      title: 'Vitamin C',
      dataIndex: 'vitamin_c',
      render: (vitaminC: string) => (
        <Space>
          <MedicineBoxOutlined style={{ color: '#52c41a' }} />
          <Text>{vitaminC || 'Not set'}</Text>
        </Space>
      ),
      sorter: true,
      width: 100,
    },
    {
      key: 'sales_rank',
      title: 'Sales Rank',
      dataIndex: 'sales_rank',
      render: (rank: number) => <SalesRankCell rank={rank} />,
      sorter: true,
      width: 110,
    },
    {
      key: 'created_at',
      title: 'Created',
      dataIndex: 'created_at',
      render: (date: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text style={{ fontSize: '12px' }}>
            {date ? formatDate(date) : 'N/A'}
          </Text>
        </Space>
      ),
      sorter: true,
      width: 120,
    },
    {
      key: 'updated_at',
      title: 'Updated',
      dataIndex: 'updated_at',
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#722ed1' }} />
          <Text style={{ fontSize: '12px' }}>
            {date ? formatDate(date) : 'N/A'}
          </Text>
        </Space>
      ),
      sorter: true,
      width: 120,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, record: Variant) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
          >
            Edit
          </Button>
          <Button
            danger
            ghost
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteVariant(record)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
      width: 140,
    },
  ]

  if (productLoading || variantsLoading) return <LoadingSpinner tip="Loading product details..." />
  if (productError) return <ErrorAlert description={productError} onRetry={refetchProduct} />
  if (!product) return <ErrorAlert message="Product not found" onRetry={() => navigate('/products')} />

  return (
    <>
      <style>
        {`
          .product-detail-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 32px;
            border-radius: 12px;
            margin-bottom: 24px;
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          .product-detail-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          .product-info-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            overflow: hidden;
            transition: all 0.3s ease;
          }
          
          .product-info-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(0,0,0,0.18);
          }
          
          .product-image-container {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 300px;
            position: relative;
          }
          
          .product-image-container::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 0%, rgba(24,144,255,0.05) 100%);
            pointer-events: none;
          }
          
          .variants-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            overflow: hidden;
          }
          
          .stats-card {
            background: linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            border: 1px solid #e8f4fd;
          }
          
          .back-button {
            background: rgba(255,255,255,0.9);
            border: none;
            border-radius: 8px;
            color: #1890ff;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .back-button:hover {
            background: white;
            transform: translateX(-4px);
            box-shadow: 0 4px 12px rgba(24,144,255,0.2);
          }
          
          .add-variant-button {
            background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
            border: none;
            border-radius: 8px;
            height: 40px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(82,196,26,0.3);
          }
          
          .add-variant-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(82,196,26,0.4);
          }
          
          .category-tag {
            border-radius: 20px;
            font-weight: 500;
            padding: 4px 12px;
            font-size: 13px;
          }
          
          .description-text {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #1890ff;
            margin: 8px 0;
          }
        `}
      </style>

      <div className="product-detail-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Button
            className="back-button"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/products')}
            style={{ marginBottom: 16 }}
          >
            Back to Products
          </Button>

          <Space direction="vertical" size="small">
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <ShoppingOutlined style={{ marginRight: 12 }} />
              {product.name}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
              Product details and variant management
            </Text>
          </Space>
        </div>
      </div>

      <div className="stats-card">
        <Row gutter={24}>
          <Col xs={24} sm={8} md={4}>
            <Statistic
              title="Total Variants"
              value={variantStats.total}
              prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Statistic
              title="Average Price"
              value={variantStats.avgPrice}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              precision={2}
              suffix="$"
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Statistic
              title="Max Calories"
              value={variantStats.maxCalories}
              prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
              suffix="cal"
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Statistic
              title="Max Caffeine"
              value={variantStats.maxCaffeine}
              prefix={<ThunderboltOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
              suffix="mg"
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Statistic
              title="Avg Protein"
              value={variantStats.avgProtein}
              prefix={<ExperimentOutlined style={{ color: '#13c2c2' }} />}
              valueStyle={{ color: '#13c2c2' }}
              precision={1}
              suffix="g"
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Statistic
              title="Avg Fibre"
              value={variantStats.avgFibre}
              prefix={<HeartOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
              precision={1}
              suffix="g"
            />
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={6}>
          <Card className="product-info-card" title={
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong>Product Information</Text>
            </Space>
          }>
            <div className="product-image-container" style={{ minHeight: '200px', padding: '20px' }}>
              {product.link_image ? (
                <Image
                  src={product.link_image}
                  alt={product.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 180,
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
              ) : (
                <div style={{
                  height: 140,
                  width: '100%',
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  flexDirection: 'column',
                  borderRadius: '12px'
                }}>
                  <AppstoreOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                  <Text>No Image Available</Text>
                </div>
              )}
            </div>

            <Divider />

            <Descriptions column={1} size="middle">
              <Descriptions.Item
                label={<Text strong>Name</Text>}
              >
                <Text style={{ fontSize: 16 }}>{product.name}</Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={<Text strong>Category</Text>}
              >
                <Tag
                  className="category-tag"
                  color={getCategoryColor(product.categories_id)}
                  icon={<StarOutlined />}
                >
                  {getCategoryName(product.categories_id)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={<Text strong>Description</Text>}
              >
                <div className="description-text">
                  <Text>{product.descriptions || 'No description available'}</Text>
                </div>
              </Descriptions.Item>

              <Descriptions.Item
                label={<Text strong>Created Date</Text>}
              >
                <Text>{product.created_at ? formatDate(product.created_at) : 'N/A'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={18}>
          <Card
            className="variants-card"
            title={
              <Space>
                <AppstoreOutlined style={{ color: '#1890ff' }} />
                <Text strong>Product Variants</Text>
                <Badge count={variants.length} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            }
            extra={
              <Button
                className="add-variant-button"
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
        title={
          <Space>
            {modalMode === 'add' ? <PlusOutlined /> : <EditOutlined />}
            <Text strong>
              {modalMode === 'add' ? 'Add Product Variant' : 'Edit Product Variant'}
            </Text>
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={modalMode === 'add' ? 'Add Variant' : 'Update Variant'}
        confirmLoading={createVariantMutation.loading || updateVariantMutation.loading}
        width={800}
        style={{ top: 20 }}
      >
        <Divider />
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
            sales_rank: undefined,
            dietary_fibre_g: undefined,
            sugars_g: undefined,
            protein_g: undefined,
            vitamin_a: '',
            vitamin_c: ''
          }}
        >
          <Form.Item name="product_id" style={{ display: 'none' }}>
            <Input />
          </Form.Item>

          <Form.Item
            name="beverage_option"
            label={
              <Space>
                <AppstoreOutlined />
                <Text strong>Beverage Option</Text>
              </Space>
            }
            rules={[{ max: 100, message: 'Option name must be less than 100 characters' }]}
          >
            <Input
              placeholder="e.g., Small, Medium, Large, Decaf, etc."
              size="large"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="price"
                label={
                  <Space>
                    <DollarOutlined style={{ color: '#52c41a' }} />
                    <Text strong>Price ($)</Text>
                  </Space>
                }
                rules={commonRules.price}
              >
                <InputNumber
                  placeholder="0.00"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  step={0.01}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sales_rank"
                label={
                  <Space>
                    <TrophyOutlined style={{ color: '#faad14' }} />
                    <Text strong>Sales Rank</Text>
                  </Space>
                }
                rules={[{ type: 'number', min: 1, message: 'Sales rank must be positive' }]}
              >
                <InputNumber
                  placeholder="1"
                  style={{ width: '100%' }}
                  size="large"
                  min={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="calories"
                label={
                  <Space>
                    <FireOutlined style={{ color: '#fa8c16' }} />
                    <Text strong>Calories</Text>
                  </Space>
                }
                rules={[{ type: 'number', min: 0, message: 'Calories must be positive' }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="caffeine_mg"
                label={
                  <Space>
                    <ThunderboltOutlined style={{ color: '#722ed1' }} />
                    <Text strong>Caffeine (mg)</Text>
                  </Space>
                }
                rules={[{ type: 'number', min: 0, message: 'Caffeine must be positive' }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="protein_g"
                label={
                  <Space>
                    <ExperimentOutlined style={{ color: '#13c2c2' }} />
                    <Text strong>Protein (g)</Text>
                  </Space>
                }
                rules={[{ type: 'number', min: 0, message: 'Protein must be positive' }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="dietary_fibre_g"
                label={
                  <Space>
                    <HeartOutlined style={{ color: '#eb2f96' }} />
                    <Text strong>Dietary Fibre (g)</Text>
                  </Space>
                }
                rules={[{ type: 'number', min: 0, message: 'Dietary fibre must be positive' }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sugars_g"
                label={
                  <Space>
                    <StarOutlined style={{ color: '#faad14' }} />
                    <Text strong>Sugars (g)</Text>
                  </Space>
                }
                rules={[{ type: 'number', min: 0, message: 'Sugars must be positive' }]}
              >
                <InputNumber
                  placeholder="0"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  step={0.1}
                  precision={1}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vitamin_a"
                label={
                  <Space>
                    <MedicineBoxOutlined style={{ color: '#f5222d' }} />
                    <Text strong>Vitamin A</Text>
                  </Space>
                }
                rules={[{ max: 50, message: 'Vitamin A must be less than 50 characters' }]}
              >
                <Input
                  placeholder="e.g., 10% DV, 500 IU, etc."
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vitamin_c"
                label={
                  <Space>
                    <MedicineBoxOutlined style={{ color: '#52c41a' }} />
                    <Text strong>Vitamin C</Text>
                  </Space>
                }
                rules={[{ max: 50, message: 'Vitamin C must be less than 50 characters' }]}
              >
                <Input
                  placeholder="e.g., 15% DV, 60mg, etc."
                  size="large"
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
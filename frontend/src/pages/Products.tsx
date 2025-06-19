import React, { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Modal, Form, Input, Select, Typography, Image, Tag, Space, Badge, Divider, Statistic } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ShoppingOutlined, AppstoreOutlined, StarOutlined } from '@ant-design/icons'
import {
  LoadingSpinner,
  ErrorAlert,
  showDeleteConfirm,
  showUpdateConfirm,
  showError
} from '../components'
import { useApi, useMutation, usePaginatedApi } from '../hooks'
import { productsService, categoriesService } from '../client/services'
import type { Product, ProductCreate, ProductUpdate } from '../client/types'
import { formatId, commonRules, truncateText } from '../utils'

const { Title, Text } = Typography
const { Option } = Select

const Products: React.FC = () => {
  const navigate = useNavigate()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form] = Form.useForm()

  // Fetch products with pagination - Fix pagination parameters
  const fetchProducts = useCallback((page: number, size: number) => {
    const skip = (page - 1) * size
    return productsService.getAll({ skip, limit: size })
  }, [])

  const {
    data: products,
    total: totalProducts,
    page: currentPage,
    pageSize,
    loading: productsLoading,
    error: productsError,
    changePage,
    refresh: refetchProducts
  } = usePaginatedApi(
    fetchProducts,
    1,
    12 // Changed to 12 for better grid layout (3x4 or 4x3)
  )

  // Fetch categories for dropdown
  const {
    data: categoriesResponse,
    loading: categoriesLoading
  } = useApi(() => categoriesService.getAll(), { immediate: true })

  // Mutations
  const createMutation = useMutation(
    (data: ProductCreate) => productsService.create(data),
    {
      onSuccess: () => { refetchProducts(); setIsModalVisible(false); form.resetFields() },
      onError: (error) => {
        showError('Error creating product', error.message)
      }
    }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: ProductUpdate }) => productsService.update(id, data),
    {
      onSuccess: () => { refetchProducts(); setIsModalVisible(false); form.resetFields() },
      onError: (error) => {
        showError('Error updating product', error.message)
      }
    }
  )

  const deleteMutation = useMutation(
    (id: string) => productsService.delete(id),
    {
      onSuccess: () => refetchProducts(),
      onError: (error) => {
        showError('Error deleting product', error.message)
      }
    }
  )

  const categories = categoriesResponse?.data || []

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    if (categories) {
      for (const category of categories) {
        map.set(category.id, category.name)
      }
    }
    return map
  }, [categories])

  // Handlers
  const showAddModal = () => {
    setModalMode('add')
    setEditingProduct(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (product: Product) => {
    setModalMode('edit')
    setEditingProduct(product)
    form.setFieldsValue({
      name: product.name,
      descriptions: product.descriptions,
      link_image: product.link_image,
      categories_id: product.categories_id,
    })
    setIsModalVisible(true)
  }

  const handleDelete = (product: Product) => {
    showDeleteConfirm(product.name, () => { void deleteMutation.mutate(product.id) })
  }

  const handleCancel = () => {
    form.resetFields()
    setIsModalVisible(false)
  }

  const onFinish = async (values: ProductCreate | ProductUpdate) => {
    if (modalMode === 'add') {
      createMutation.mutate(values as ProductCreate)
    } else if (modalMode === 'edit' && editingProduct) {
      showUpdateConfirm(values.name || editingProduct.name, () => {
        updateMutation.mutate({ id: editingProduct.id, data: values })
      })
    }
  }

  const handlePageChange = (page: number, size: number) => {
    changePage(page, size)
  }

  const getCategoryName = useCallback((categoryId: string) => {
    return categoryMap.get(categoryId) || 'Unknown Category'
  }, [categoryMap])

  const getCategoryColor = useCallback((categoryId: string) => {
    const colors = ['blue', 'green', 'orange', 'purple', 'red', 'cyan', 'magenta', 'gold']
    const index = Array.from(categoryMap.keys()).indexOf(categoryId)
    return colors[index % colors.length] || 'default'
  }, [categoryMap])

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`)
  }

  if (productsLoading || categoriesLoading) return <LoadingSpinner tip="Loading products..." />
  if (productsError) return <ErrorAlert description={productsError} onRetry={refetchProducts} />

  return (
    <>
      <style>
        {`
          .products-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 32px;
            border-radius: 12px;
            margin-bottom: 24px;
            color: white;
            position: relative;
            overflow: hidden;
          }
          
          .products-header::before {
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
          
          .products-stats {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 24px;
          }
          
          .product-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #f0f0f0;
          }
          
          .product-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.15);
            border-color: #1890ff;
          }
          
          .product-image-container {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .product-image-container img {
            transition: transform 0.3s ease;
          }
          
          .product-card:hover .product-image-container img {
            transform: scale(1.02);
          }
          
          .product-image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, rgba(24,144,255,0.8), rgba(114,46,209,0.8));
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .product-card:hover .product-image-overlay {
            opacity: 1;
          }
          
          .product-quick-actions {
            display: flex;
            gap: 8px;
          }
          
          .product-quick-actions .ant-btn {
            border: none;
            background: rgba(255,255,255,0.9);
            color: #1890ff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .product-quick-actions .ant-btn:hover {
            background: white;
            transform: scale(1.1);
          }
          
          .category-tag {
            border-radius: 20px;
            font-weight: 500;
          }
          
          .pagination-container {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-top: 24px;
          }
        `}
      </style>

      <div className="products-header">
        <Space direction="vertical" size="small" style={{ position: 'relative', zIndex: 1 }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            <ShoppingOutlined style={{ marginRight: 12 }} />
            Products Catalog
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
            Discover and manage your amazing product collection
          </Text>
        </Space>
      </div>

      <div className="products-stats">
        <Row gutter={24}>
          <Col xs={24} sm={8}>
            <Statistic
              title="Total Products"
              value={totalProducts}
              prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Categories"
              value={categories.length}
              prefix={<StarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Statistic
              title="Current Page"
              value={`${currentPage} / ${Math.ceil(totalProducts / pageSize)}`}
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
        </Row>

        <Divider />

        <div style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            loading={createMutation.loading}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px',
              height: '48px',
              paddingLeft: '24px',
              paddingRight: '24px'
            }}
          >
            Add New Product
          </Button>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {products.map((product) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
            <Card
              className="product-card"
              hoverable
              cover={
                <div className="product-image-container" style={{ height: 240, padding: '12px' }}>
                  {product.link_image ? (
                    <img
                      alt={product.name}
                      src={product.link_image}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div style="
                              height: 100%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                              color: #999;
                              font-size: 16px;
                              flex-direction: column;
                              border-radius: 8px;
                            ">
                              <div style="font-size: 48px; margin-bottom: 8px;">📦</div>
                              No Image
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                      color: '#999',
                      fontSize: 16,
                      flexDirection: 'column'
                    }}>
                      <AppstoreOutlined style={{ fontSize: 48, marginBottom: 8 }} />
                      No Image
                    </div>
                  )}
                  <div className="product-image-overlay">
                    <div className="product-quick-actions">
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleProductClick(product.id)}
                      />
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(product)}
                      />
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(product)}
                        danger
                      />
                    </div>
                  </div>
                </div>
              }
            >
              <Card.Meta
                title={
                  <div
                    style={{
                      cursor: 'pointer',
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#1890ff',
                      marginBottom: 8
                    }}
                    onClick={() => handleProductClick(product.id)}
                  >
                    {product.name}
                  </div>
                }
                description={
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Tag
                      className="category-tag"
                      color={getCategoryColor(product.categories_id)}
                    >
                      {getCategoryName(product.categories_id)}
                    </Tag>

                    <Text style={{ color: '#666', fontSize: 13, lineHeight: 1.4 }}>
                      {truncateText(product.descriptions || 'No description available', 80)}
                    </Text>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 8,
                      paddingTop: 8,
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <Badge
                        count={formatId(product.id)}
                        style={{
                          backgroundColor: '#f0f0f0',
                          color: '#999',
                          fontSize: 10
                        }}
                      />
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleProductClick(product.id)}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        View Details →
                      </Button>
                    </div>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {products.length === 0 && !productsLoading && (
        <div style={{
          textAlign: 'center',
          marginTop: 48,
          padding: 48,
          background: 'white',
          borderRadius: 12,
          border: '2px dashed #d9d9d9'
        }}>
          <AppstoreOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
          <Title level={4} style={{ color: '#999' }}>No Products Found</Title>
          <Text style={{ color: '#999', marginBottom: 24, display: 'block' }}>
            Start building your product catalog by adding your first product.
          </Text>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={showAddModal}
          >
            Add Your First Product
          </Button>
        </div>
      )}

      {totalProducts > 0 && (
        <div className="pagination-container">
          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Text strong>Showing:</Text>
                <Text>{((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalProducts)} of {totalProducts} products</Text>
              </Space>
            </Col>
            <Col>
              <Space size="large">
                <Button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1, pageSize)}
                  style={{ borderRadius: '6px' }}
                >
                  ← Previous
                </Button>

                <Select
                  value={pageSize}
                  onChange={(value) => handlePageChange(1, value)}
                  style={{ width: 140 }}
                >
                  <Option value={12}>12 per page</Option>
                  <Option value={24}>24 per page</Option>
                  <Option value={36}>36 per page</Option>
                  <Option value={48}>48 per page</Option>
                </Select>

                <Button
                  disabled={currentPage >= Math.ceil(totalProducts / pageSize)}
                  onClick={() => handlePageChange(currentPage + 1, pageSize)}
                  style={{ borderRadius: '6px' }}
                >
                  Next →
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      )}

      <Modal
        title={
          <Space>
            <ShoppingOutlined />
            {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={modalMode === 'add' ? 'Create Product' : 'Update Product'}
        confirmLoading={createMutation.loading || updateMutation.loading}
        width={700}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ name: '', descriptions: '', link_image: '', categories_id: '' }}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={commonRules.name}
          >
            <Input
              placeholder="Enter an amazing product name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="descriptions"
            label="Description"
            rules={commonRules.description}
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe what makes this product special..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="categories_id"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select
              placeholder="Choose the perfect category"
              showSearch
              optionFilterProp="children"
              size="large"
            >
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="link_image"
            label="Product Image URL"
            rules={commonRules.url}
          >
            <Input
              placeholder="https://example.com/product-image.jpg"
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Products
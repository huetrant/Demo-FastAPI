import React, { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Button, Modal, Form, Input, Select, Typography, Image } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
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

  // Fetch products with pagination
  const fetchProducts = useCallback((page: number, size: number) => productsService.getAll({ page, pageSize: size }), [])
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
    9
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

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`)
  }

  if (productsLoading || categoriesLoading) return <LoadingSpinner tip="Loading products..." />
  if (productsError) return <ErrorAlert description={productsError} onRetry={refetchProducts} />

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Products</Title>
        <Text type="secondary">Manage your product catalog</Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
          loading={createMutation.loading}
        >
          Add Product
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <Col xs={24} sm={12} md={8} key={product.id}>
            <Card
              hoverable
              cover={
                <div style={{ height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
                  {product.link_image ? (
                    <Image
                      alt={product.name}
                      src={product.link_image}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                    />
                  ) : (
                    <div style={{ color: '#999' }}>No Image</div>
                  )}
                </div>
              }
              actions={[
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleProductClick(product.id)}
                  key="view"
                >
                  View
                </Button>,
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(product)}
                  key="edit"
                >
                  Edit
                </Button>,
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(product)}
                  key="delete"
                >
                  Delete
                </Button>,
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ cursor: 'pointer' }} onClick={() => handleProductClick(product.id)}>
                    {product.name}
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">{getCategoryName(product.categories_id)}</Text>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      {truncateText(product.descriptions || 'No description', 60)}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      ID: {formatId(product.id)}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {products.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          No products found. Click "Add Product" to create your first product.
        </div>
      )}

      {totalProducts > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1, pageSize)}
          >
            Previous
          </Button>
          <span style={{ margin: '0 16px' }}>
            Page {currentPage} of {Math.ceil(totalProducts / pageSize)}
          </span>
          <Button
            disabled={currentPage >= Math.ceil(totalProducts / pageSize)}
            onClick={() => handlePageChange(currentPage + 1, pageSize)}
          >
            Next
          </Button>
          <Select
            value={pageSize}
            onChange={(value) => handlePageChange(1, value)}
            style={{ width: 120, marginLeft: 16 }}
          >
            <Option value={9}>9 / page</Option>
            <Option value={18}>18 / page</Option>
            <Option value={27}>27 / page</Option>
            <Option value={36}>36 / page</Option>
          </Select>
          <span style={{ marginLeft: 16, color: '#999' }}>Total: {totalProducts}</span>
        </div>
      )}

      <Modal
        title={modalMode === 'add' ? 'Add Product' : 'Edit Product'}
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
          initialValues={{ name: '', descriptions: '', link_image: '', categories_id: '' }}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={commonRules.name}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="descriptions"
            label="Description"
            rules={commonRules.description}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter product description"
            />
          </Form.Item>

          <Form.Item
            name="categories_id"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select placeholder="Select a category" showSearch optionFilterProp="children">
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="link_image"
            label="Image URL"
            rules={commonRules.url}
          >
            <Input placeholder="Enter image URL (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Products

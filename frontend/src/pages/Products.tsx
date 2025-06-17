import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../store/slices/productsSlice'
import { fetchCategories } from '../store/slices/categoriesSlice'
import type { RootState, AppDispatch } from '../store'
import { Row, Col, Card, Button, Modal, Form, Input, Spin, Alert, Pagination, Image, Select, message } from 'antd'

import { Product } from '../interfaces'

const { confirm } = Modal

const Products: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { items, total, loading, error } = useSelector((state: RootState) => state.products)
  const { items: categories } = useSelector((state: RootState) => state.categories)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 9

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, pageSize }))
    dispatch(fetchCategories())
  }, [dispatch, currentPage])

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`)
  }

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

  const handleDelete = (id: string, productName: string) => {
    confirm({
      title: 'Delete Product',
      content: `Are you sure you want to delete "${productName}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await dispatch(deleteProduct(id)).unwrap()
          dispatch(fetchProducts({ page: currentPage, pageSize }))
          message.success('Product deleted successfully')
        } catch (error) {
          message.error('Failed to delete product')
        }
      },
    })
  }

  const handleCancel = () => {
    form.resetFields()
    setIsModalVisible(false)
  }

  const onFinish = async (values: any) => {
    if (modalMode === 'add') {
      // Create: No confirmation needed
      try {
        await dispatch(createProduct(values)).unwrap()
        setIsModalVisible(false)
        form.resetFields()
        dispatch(fetchProducts({ page: currentPage, pageSize }))
        message.success('Product created successfully')
      } catch (error) {
        message.error('Failed to create product')
      }
    } else if (modalMode === 'edit' && editingProduct) {
      // Update: Confirmation needed
      confirm({
        title: 'Update Product',
        content: `Are you sure you want to update "${values.name || editingProduct.name}"?`,
        okText: 'Yes, Update',
        cancelText: 'Cancel',
        async onOk() {
          try {
            await dispatch(updateProduct({ id: editingProduct.id, ...values })).unwrap()
            setIsModalVisible(false)
            form.resetFields()
            dispatch(fetchProducts({ page: currentPage, pageSize }))
            message.success('Product updated successfully')
          } catch (error) {
            message.error('Failed to update product')
          }
        },
      })
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin tip="Loading products...">
        <div style={{ minHeight: '200px' }} />
      </Spin>
    </div>
  )

  if (error) return <Alert message="Error" description={error} type="error" showIcon />

  return (
    <>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" onClick={showAddModal}>Add Product</Button>
      </div>
      <Row gutter={[16, 16]}>
        {items.map((item: Product) => (
          <Col key={item.id} span={8}>
            <Card
              size="small"
              cover={
                <div
                  onClick={() => handleProductClick(item.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {item.link_image ? (
                    <div style={{
                      height: '180px',
                      width: '100%',
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <Image
                        alt={item.name}
                        src={item.link_image}
                        width="100%"
                        height="100%"
                        style={{
                          objectFit: 'contain',
                          objectPosition: 'center'
                        }}
                        preview={{
                          mask: <div style={{ fontSize: '12px' }}>Click to zoom</div>
                        }}
                        fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0NFY0NEgyMFYyMFoiIGZpbGw9IiNEOUQ5RDkiLz4KPHBhdGggZD0iTTI2IDI4TDMwIDMyTDM0IDI4TDM4IDMyVjM4SDI2VjI4WiIgZmlsbD0iI0JGQkZCRiIvPgo8L3N2Zz4K"
                      />
                    </div>
                  ) : (
                    <div style={{
                      height: '180px',
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                      fontSize: '14px'
                    }}>
                      No Image
                    </div>
                  )}
                </div>
              }
              actions={[
                <Button
                  type="link"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    showEditModal(item)
                  }}
                >
                  Edit
                </Button>,
                <Button
                  type="link"
                  size="small"
                  danger
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id, item.name)
                  }}
                >
                  Delete
                </Button>,
              ]}
              style={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              hoverable
              onClick={() => handleProductClick(item.id)}
            >
              <Card.Meta
                title={<div style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.name}</div>}
                description={
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {item.descriptions || 'No description'}
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        onChange={page => setCurrentPage(page)}
        style={{ marginTop: 16, textAlign: 'center' }}
      />
      <Modal
        title={modalMode === 'add' ? 'Add Product' : 'Edit Product'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={modalMode === 'add' ? 'Add' : 'Update'}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ name: '', descriptions: '', link_image: '', categories_id: '' }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the product name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="descriptions"
            label="Description"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="link_image"
            label="Image URL"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="categories_id"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select placeholder="Select a category">
              {categories.map((category: any) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Products

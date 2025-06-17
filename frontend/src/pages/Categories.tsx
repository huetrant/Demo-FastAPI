import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../store/slices/categoriesSlice'
import type { RootState, AppDispatch } from '../store'
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Alert,
  Typography,
  message,
  Pagination
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons'
import { Category } from '../interfaces'

const { Title, Text } = Typography
const { confirm } = Modal

const Categories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { items, loading, error } = useSelector((state: RootState) => state.categories)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [form] = Form.useForm()

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  const showAddModal = () => {
    setModalMode('add')
    setEditingCategory(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (category: Category) => {
    setModalMode('edit')
    setEditingCategory(category)
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    })
    setIsModalVisible(true)
  }

  const handleDelete = (id: string, categoryName: string) => {
    confirm({
      title: 'Delete Category',
      content: `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await dispatch(deleteCategory(id)).unwrap()
          dispatch(fetchCategories())
          message.success('Category deleted successfully')
        } catch (error) {
          message.error('Failed to delete category')
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
        await dispatch(createCategory(values)).unwrap()
        setIsModalVisible(false)
        form.resetFields()
        dispatch(fetchCategories())
        message.success('Category created successfully')
      } catch (error) {
        message.error('Failed to create category')
      }
    } else if (modalMode === 'edit' && editingCategory) {
      // Update: Confirmation needed
      confirm({
        title: 'Update Category',
        content: `Are you sure you want to update "${values.name || editingCategory.name}"?`,
        okText: 'Yes, Update',
        cancelText: 'Cancel',
        async onOk() {
          try {
            await dispatch(updateCategory({ id: editingCategory.id, ...values })).unwrap()
            setIsModalVisible(false)
            form.resetFields()
            dispatch(fetchCategories())
            message.success('Category updated successfully')
          } catch (error) {
            message.error('Failed to update category')
          }
        },
      })
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin tip="Loading categories...">
        <div style={{ minHeight: '200px' }} />
      </Spin>
    </div>
  )

  if (error) return <Alert message="Error" description={error} type="error" showIcon />

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentItems = Array.isArray(items) ? items.slice(startIndex, endIndex) : []

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Categories</Title>
        <Text type="secondary">Manage product categories</Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Category
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {currentItems.map((item: Category) => (
          <Col key={item.id} span={6}>
            <Card
              size="small"
              style={{
                height: '100%',
                transition: 'all 0.3s ease',
              }}
              hoverable
              actions={[
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
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
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id, item.name)
                  }}
                >
                  Delete
                </Button>,
              ]}
            >
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <AppstoreOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <Card.Meta
                  title={<div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{item.name}</div>}
                  description={
                    <div style={{
                      fontSize: '14px',
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '60px'
                    }}>
                      {item.description || 'No description'}
                    </div>
                  }
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {items.length > pageSize && (
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={items.length}
          onChange={page => setCurrentPage(page)}
          style={{ marginTop: 24, textAlign: 'center' }}
          showSizeChanger={false}
          showQuickJumper
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} categories`}
        />
      )}

      <Modal
        title={modalMode === 'add' ? 'Add Category' : 'Edit Category'}
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
          initialValues={{ name: '', description: '' }}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please input the category name!' }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the category description!' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Enter category description"
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Categories

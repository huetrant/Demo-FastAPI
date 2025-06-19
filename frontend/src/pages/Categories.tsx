import React, { useCallback, useState } from 'react'
import { Card, Row, Col, Button, Modal, Form, Input, Typography, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  LoadingSpinner,
  ErrorAlert,
  showDeleteConfirm,
  showUpdateConfirm
} from '../components'
import { usePaginatedApi, useMutation } from '../hooks'
import { categoriesService } from '../client/services'
import type { Category, CategoryCreate, CategoryUpdate } from '../client/types'
import { formatId, commonRules, truncateText } from '../utils'

const { Title, Text } = Typography
const { Option } = Select

const Categories: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()

  // Fetch categories with pagination
  const fetchCategories = useCallback((page: number, size: number) => categoriesService.getAll({ page, pageSize: size }), [])
  const {
    data: categories,
    total: totalCategories,
    page: currentPage,
    pageSize,
    loading: categoriesLoading,
    error: categoriesError,
    changePage,
    refresh: refetchCategories
  } = usePaginatedApi(
    fetchCategories,
    1,
    9
  )

  // Mutations
  const createMutation = useMutation(
    (data: CategoryCreate) => categoriesService.create(data),
    { onSuccess: () => { refetchCategories(); setIsModalVisible(false); form.resetFields() } }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: CategoryUpdate }) => categoriesService.update(id, data),
    { onSuccess: () => { refetchCategories(); setIsModalVisible(false); form.resetFields() } }
  )

  const deleteMutation = useMutation(
    (id: string) => categoriesService.delete(id),
    { onSuccess: () => refetchCategories() }
  )

  // Handlers
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

  const handleDelete = (category: Category) => {
    showDeleteConfirm(category.name, () => { deleteMutation.mutate(category.id) })
  }

  const handleCancel = () => {
    form.resetFields()
    setIsModalVisible(false)
  }

  const onFinish = async (values: CategoryCreate | CategoryUpdate) => {
    if (modalMode === 'add') {
      createMutation.mutate(values as CategoryCreate)
    } else if (modalMode === 'edit' && editingCategory) {
      showUpdateConfirm(values.name || editingCategory.name, () => {
        updateMutation.mutate({ id: editingCategory.id, data: values })
      })
    }
  }

  if (categoriesLoading) return <LoadingSpinner tip="Loading categories..." />
  if (categoriesError) return <ErrorAlert description={categoriesError} onRetry={refetchCategories} />

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Categories</Title>
        <Text type="secondary">Manage your product categories</Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
          loading={createMutation.loading}
        >
          Add Category
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {categories.map((category) => (
          <Col xs={24} sm={12} md={8} key={category.id}>
            <Card
              hoverable
              actions={[
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => showEditModal(category)}
                  key="edit"
                >
                  Edit
                </Button>,
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(category)}
                  key="delete"
                >
                  Delete
                </Button>,
              ]}
            >
              <Card.Meta
                title={category.name}
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      {truncateText(category.description || 'No description', 80)}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      ID: {formatId(category.id)}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
          No categories found. Click "Add Category" to create your first category.
        </div>
      )}

      {totalCategories > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
          <Button
            disabled={currentPage === 1}
            onClick={() => changePage(currentPage - 1, pageSize)}
          >
            Previous
          </Button>
          <span style={{ margin: '0 16px' }}>
            Page {currentPage} of {Math.ceil(totalCategories / pageSize)}
          </span>
          <Button
            disabled={currentPage >= Math.ceil(totalCategories / pageSize)}
            onClick={() => changePage(currentPage + 1, pageSize)}
          >
            Next
          </Button>
          <Select
            value={pageSize}
            onChange={(value) => changePage(1, value)}
            style={{ width: 120, marginLeft: 16 }}
          >
            <Option value={9}>9 / page</Option>
            <Option value={18}>18 / page</Option>
            <Option value={27}>27 / page</Option>
            <Option value={36}>36 / page</Option>
          </Select>
          <span style={{ marginLeft: 16, color: '#999' }}>Total: {totalCategories}</span>
        </div>
      )}

      <Modal
        title={modalMode === 'add' ? 'Add Category' : 'Edit Category'}
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
          initialValues={{ name: '', description: '' }}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={commonRules.name}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={commonRules.description}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter category description"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Categories

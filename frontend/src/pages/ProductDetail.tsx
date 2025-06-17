import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchVariantsByProduct, createVariant, updateVariant, deleteVariant } from '../store/slices/variantsSlice'
import { fetchProduct } from '../store/slices/productsSlice'
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
  Breadcrumb,
  Table,
  InputNumber,
  message,
  Space,
  Tag
} from 'antd'
import { ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { Variant } from '../interfaces'

const { Title, Text } = Typography
const { confirm } = Modal

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const { items: variants, loading, error } = useSelector((state: RootState) => state.variants)
  const { currentProduct, currentProductLoading } = useSelector((state: RootState) => state.products)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)

  const [form] = Form.useForm()

  useEffect(() => {
    if (productId) {
      dispatch(fetchVariantsByProduct(productId))
      dispatch(fetchProduct(productId))
    }
  }, [dispatch, productId])

  const showAddModal = () => {
    setModalMode('add')
    setEditingVariant(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const showEditModal = (variant: Variant) => {
    confirm({
      title: 'Edit Variant',
      content: `Are you sure you want to edit this variant?`,
      okText: 'Yes, Edit',
      cancelText: 'Cancel',
      onOk() {
        setModalMode('edit')
        setEditingVariant(variant)
        form.setFieldsValue({
          beverage_option: variant.beverage_option,
          calories: variant.calories,
          dietary_fibre_g: variant.dietary_fibre_g,
          sugars_g: variant.sugars_g,
          protein_g: variant.protein_g,
          vitamin_a: variant.vitamin_a,
          vitamin_c: variant.vitamin_c,
          caffeine_mg: variant.caffeine_mg,
          price: variant.price,
          sales_rank: variant.sales_rank,
        })
        setIsModalVisible(true)
      },
    })
  }

  const handleDelete = (id: string, variantName: string) => {
    confirm({
      title: 'Delete Variant',
      content: `Are you sure you want to delete "${variantName}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await dispatch(deleteVariant(id)).unwrap()
          if (productId) {
            dispatch(fetchVariantsByProduct(productId))
          }
          message.success('Variant deleted successfully')
        } catch (error) {
          message.error('Failed to delete variant')
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
    const variantName = values.beverage_option || 'this variant'

    confirm({
      title: `${modalMode === 'add' ? 'Create' : 'Update'} Variant`,
      content: `Are you sure you want to ${action} "${variantName}"?`,
      okText: `Yes, ${modalMode === 'add' ? 'Create' : 'Update'}`,
      cancelText: 'Cancel',
      async onOk() {
        try {
          const variantData = { ...values, product_id: productId }

          if (modalMode === 'add') {
            await dispatch(createVariant(variantData)).unwrap()
          } else if (modalMode === 'edit' && editingVariant) {
            await dispatch(updateVariant({ id: editingVariant.id, ...variantData })).unwrap()
          }

          setIsModalVisible(false)
          form.resetFields()
          if (productId) {
            dispatch(fetchVariantsByProduct(productId))
          }
          message.success(`Variant ${modalMode === 'add' ? 'created' : 'updated'} successfully`)
        } catch (error) {
          message.error(`Failed to ${action} variant`)
        }
      },
    })
  }

  const columns = [
    {
      title: 'Beverage Option',
      dataIndex: 'beverage_option',
      key: 'beverage_option',
      render: (text: string) => text || '-',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price ? `$${price.toFixed(2)}` : '-',
    },
    {
      title: 'Calories',
      dataIndex: 'calories',
      key: 'calories',
      render: (calories: number) => calories ? `${calories} cal` : '-',
    },
    {
      title: 'Caffeine',
      dataIndex: 'caffeine_mg',
      key: 'caffeine_mg',
      render: (caffeine: number) => caffeine ? `${caffeine} mg` : '-',
    },
    {
      title: 'Sales Rank',
      dataIndex: 'sales_rank',
      key: 'sales_rank',
      render: (rank: number) => rank ? <Tag color="blue">#{rank}</Tag> : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Variant) => (
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
            onClick={() => handleDelete(record.id, record.beverage_option || 'Variant')}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  if (loading || currentProductLoading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin tip="Loading...">
        <div style={{ minHeight: '200px' }} />
      </Spin>
    </div>
  )

  if (error) return <Alert message="Error" description={error} type="error" showIcon />

  return (
    <>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/products')}
            style={{ padding: 0 }}
          >
            Products
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{currentProduct?.name || 'Product Details'}</Breadcrumb.Item>
      </Breadcrumb>

      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Product Variants</Title>
        <Text type="secondary">Manage variants for "{currentProduct?.name || 'this product'}"</Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Variant
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={variants}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} variants`,
        }}
      />

      <Modal
        title={modalMode === 'add' ? 'Add Variant' : 'Edit Variant'}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        okText={modalMode === 'add' ? 'Add' : 'Update'}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            beverage_option: '',
            calories: null,
            dietary_fibre_g: null,
            sugars_g: null,
            protein_g: null,
            vitamin_a: '',
            vitamin_c: '',
            caffeine_mg: null,
            price: null,
            sales_rank: null,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="beverage_option"
                label="Beverage Option"
                rules={[{ required: true, message: 'Please input the beverage option!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price ($)"
                rules={[{ required: true, message: 'Please input the price!' }]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="calories" label="Calories">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="caffeine_mg" label="Caffeine (mg)">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dietary_fibre_g" label="Dietary Fibre (g)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sugars_g" label="Sugars (g)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="protein_g" label="Protein (g)">
                <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sales_rank" label="Sales Rank">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="vitamin_a" label="Vitamin A">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="vitamin_c" label="Vitamin C">
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default ProductDetail

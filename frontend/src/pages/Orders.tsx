import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, Form, Select, InputNumber, DatePicker, Typography, Space, Tag, Badge } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined, ShopOutlined, UserOutlined, CalendarOutlined, DollarOutlined } from '@ant-design/icons'
import {
  LoadingSpinner,
  ErrorAlert,
  DataTable,
  showDeleteConfirm,
  showUpdateConfirm
} from '../components'
import { usePaginatedApi, useMutation } from '../hooks'
import { ordersService, customersService, storesService } from '../client/services'
import type { Order, OrderCreate, OrderUpdate, TableColumn, Customer, Store } from '../client/types'
import { formatDate, formatCurrency, formatPriceWithColor, formatValueWithColor, commonRules } from '../utils'
import { PriceCell } from '../utils/colorFormatters'

const { Title, Text } = Typography
const { Option } = Select

const Orders: React.FC = () => {
  const navigate = useNavigate()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [form] = Form.useForm()
  const [searchedCustomers, setSearchedCustomers] = useState<Customer[]>([])
  const [searchedStores, setSearchedStores] = useState<Store[]>([])
  const [customerSearchLoading, setCustomerSearchLoading] = useState(false)
  const [storeSearchLoading, setStoreSearchLoading] = useState(false)
  const [dataCache, setDataCache] = useState<{ customers: Record<string, string>, stores: Record<string, string> }>({ customers: {}, stores: {} });

  // Fetch orders with pagination
  const fetchOrders = useCallback((page: number, size: number) => ordersService.getAll({ page, pageSize: size }), [])
  const {
    data: orders,
    total: totalOrders,
    page: currentPage,
    pageSize,
    loading: ordersLoading,
    error: ordersError,
    changePage,
    refresh: refetchOrders
  } = usePaginatedApi(
    fetchOrders,
    1,
    10
  )


  // Mutations
  const createMutation = useMutation(
    (data: OrderCreate) => ordersService.create(data),
    { onSuccess: () => { refetchOrders(); setIsModalVisible(false); form.resetFields() } }
  )

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: OrderUpdate }) => ordersService.update(id, data),
    { onSuccess: () => { refetchOrders(); setIsModalVisible(false); form.resetFields() } }
  )

  const deleteMutation = useMutation(
    (id: string) => ordersService.delete(id),
    { onSuccess: () => refetchOrders() }
  )


  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCustomerSearch = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(async () => {
      if (value) {
        setCustomerSearchLoading(true);
        try {
          const response = await customersService.getAll({ search: value, pageSize: 50 });
          setSearchedCustomers(response.data.data);
        } catch (error) {
          console.error('Failed to search customers:', error);
        } finally {
          setCustomerSearchLoading(false);
        }
      } else {
        setSearchedCustomers([]);
      }
    }, 300);
  };

  const handleStoreSearch = (value: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(async () => {
      if (value) {
        setStoreSearchLoading(true);
        try {
          const response = await storesService.getAll({ search: value, pageSize: 50 });
          setSearchedStores(response.data.data);
        } catch (error) {
          console.error('Failed to search stores:', error);
        } finally {
          setStoreSearchLoading(false);
        }
      } else {
        setSearchedStores([]);
      }
    }, 300);
  };

  useEffect(() => {
    let isMounted = true;
    if (orders.length > 0) {
      const customerIds = new Set(orders.map(o => o.customer_id));
      const storeIds = new Set(orders.map(o => o.store_id));

      const newCache = { ...dataCache };
      let cacheUpdated = false;

      const fetchMissingData = async () => {
        const customersToFetch = Array.from(customerIds).filter(id => !newCache.customers[id]);
        const storesToFetch = Array.from(storeIds).filter(id => !newCache.stores[id]);

        if (customersToFetch.length > 0) {
          try {
            const responses = await Promise.all(customersToFetch.map(id => customersService.getById(id)));
            if (isMounted) {
              responses.forEach(response => {
                const customer = response.data;
                newCache.customers[customer.id] = customer.name || customer.username;
                cacheUpdated = true;
              });
            }
          } catch (error) {
            console.error("Failed to fetch customer details", error);
          }
        }

        if (storesToFetch.length > 0) {
          try {
            const responses = await Promise.all(storesToFetch.map(id => storesService.getById(id)));
            if (isMounted) {
              responses.forEach(response => {
                const store = response.data;
                newCache.stores[store.id] = store.name || store.name_store || 'Unknown Store';
                cacheUpdated = true;
              });
            }
          } catch (error) {
            console.error("Failed to fetch store details", error);
          }
        }

        if (cacheUpdated && isMounted) {
          setDataCache(newCache);
        }
      };

      fetchMissingData();
    }
    return () => {
      isMounted = false;
    }
  }, [orders, dataCache]);

  const getCustomerName = (customerId: string) => {
    return dataCache.customers[customerId] || customerId;
  }

  const getStoreName = (storeId: string) => {
    return dataCache.stores[storeId] || storeId;
  }

  // Generate sequential order number continuing across pages
  const getOrderNumber = (index: number) => {
    const orderNum = (currentPage - 1) * pageSize + index + 1
    return String(orderNum).padStart(4, '0')
  }

  // Only use colors for important differentiation - customers and stores don't need colors
  // Remove color functions for customers and stores to reduce visual noise

  // Get order status color based on total amount
  const getOrderStatusColor = (totalAmount: number) => {
    // Simplified to 2 colors
    if (totalAmount >= 50) return 'green' // Medium and high value orders
    if (totalAmount >= 20) return 'blue' // Regular orders
    return 'default' // Low value orders
  }

  // Get order priority based on date (recent orders get higher priority)
  const getOrderPriority = (orderDate: string | undefined) => {
    if (!orderDate) return { color: 'default', text: 'Unknown' }
    const date = new Date(orderDate)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffHours <= 24) return { color: 'red', text: 'Recent' }
    if (diffHours <= 72) return { color: 'orange', text: 'This Week' }
    return { color: 'default', text: 'Older' }
  }

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`)
  }

  // Format order total with custom thresholds
  const formatOrderTotal = (amount: number) => {
    if (!amount) return { text: '0 VND', color: '#d9d9d9' }

    // Determine color based on amount thresholds
    let color: string
    if (amount >= 1000000) color = '#52c41a' // Trên 1.000.000 - màu xanh lá
    else if (amount >= 500000) color = '#fa8c16' // Từ 500.000 đến 1.000.000 - màu cam
    else color = '#f5222d' // Dưới 500.000 - màu đỏ

    // Format currency with Vietnamese locale
    const formattedAmount = formatCurrency(amount)

    return {
      text: `💰 ${formattedAmount}`,
      color
    }
  }

  const columns: TableColumn<Order>[] = [
    {
      key: 'orderNumber',
      title: 'Order',
      render: (_, record: Order, index: number) => {
        const orderNumber = getOrderNumber(index)
        const priority = getOrderPriority(record.order_date)
        return (
          <Space>
            <Badge color={priority.color} />
            <span style={{ fontWeight: 'bold' }}>{orderNumber}</span>
          </Space>
        )
      },
    },
    {
      key: 'customer',
      title: 'Customer',
      dataIndex: 'customer_id',
      render: (customerId: string) => {
        const customerName = getCustomerName(customerId)
        return (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            {customerName}
          </span>
        )
      },
    },
    {
      key: 'store',
      title: 'Store',
      dataIndex: 'store_id',
      render: (storeId: string) => {
        const storeName = getStoreName(storeId)
        return (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <ShopOutlined style={{ marginRight: 8, color: '#52c41a' }} />
            {storeName}
          </span>
        )
      },
    },
    {
      key: 'total_amount',
      title: 'Total',
      dataIndex: 'total_amount',
      render: (amount: number) => {
        const formatted = formatOrderTotal(amount)
        return (
          <span style={{ color: formatted.color, fontWeight: 'bold' }}>
            {formatted.text}
          </span>
        )
      },
      sorter: true,
    },
    {
      key: 'order_date',
      title: 'Date',
      dataIndex: 'order_date',
      render: (date: string) => {
        const formattedDate = formatDate(date)
        return (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {formattedDate}
          </span>
        )
      },
      sorter: true,
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_: any, record: Order, index: number) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleOrderClick(record.id)}
            size="small"
          >
            View
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record, index)}
            size="small"
          >
            Delete
          </Button>
        </Space>
      ),
      width: 150,
    },
  ]

  // Handlers
  const showAddModal = () => {
    setModalMode('add')
    setEditingOrder(null)
    form.resetFields()
    setIsModalVisible(true)
  }


  const handleDelete = (order: Order, index: number) => {
    const orderNumber = getOrderNumber(index)
    showDeleteConfirm(`Order ${orderNumber}`, () => { void deleteMutation.mutate(order.id) })
  }

  const handleCancel = () => {
    form.resetFields()
    setIsModalVisible(false)
  }

  const onFinish = async (values: any) => {
    const orderData = {
      ...values,
      order_date: values.order_date ? values.order_date.toISOString() : undefined,
    }

    if (modalMode === 'add') {
      createMutation.mutate(orderData as OrderCreate)
    } else if (modalMode === 'edit' && editingOrder) {
      const orderIndex = orders.findIndex(o => o.id === editingOrder.id)
      const orderNumber = getOrderNumber(orderIndex)
      showUpdateConfirm(`Order ${orderNumber}`, () => {
        updateMutation.mutate({ id: editingOrder.id, data: orderData })
      })
    }
  }

  if (ordersLoading) return <LoadingSpinner tip="Loading orders..." />
  if (ordersError) return <ErrorAlert description={ordersError} onRetry={refetchOrders} />

  return (
    <>
      <style>
        {`
          .orders-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 24px;
            border-radius: 8px;
            margin-bottom: 24px;
            color: white;
          }
          .orders-stats {
            background: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 16px;
          }
        `}
      </style>

      <div className="orders-header">
        <Space direction="vertical" size="small">
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            📋 Orders Management
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
            Manage customer orders and transactions with enhanced visual indicators
          </Text>
        </Space>
      </div>

      <div className="orders-stats">
        <Space size="large">
          <div>
            <Text type="secondary">Total Orders: </Text>
            <Text strong style={{ color: '#1890ff' }}>{totalOrders}</Text>
          </div>
          <div>
            <Text type="secondary">Current Page: </Text>
            <Text strong style={{ color: '#52c41a' }}>{currentPage}</Text>
          </div>
          <div>
            <Text type="secondary">Page Size: </Text>
            <Text strong style={{ color: '#fa8c16' }}>{pageSize}</Text>
          </div>
        </Space>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
          loading={createMutation.loading}
          size="large"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}
        >
          Add New Order
        </Button>
      </div>

      {console.log('Orders length:', orders.length, 'PageSize:', pageSize, 'TotalOrders:', totalOrders)}
      <DataTable
        data={orders.slice(0, pageSize)}
        columns={columns}
        loading={ordersLoading || deleteMutation.loading}
        emptyText="No orders found. Click 'Add Order' to create your first order."
        onRow={(record) => ({
          onDoubleClick: () => handleOrderClick(record.id),
        })}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalOrders,
          onChange: changePage,
        }}
      />


      <Modal
        title={modalMode === 'add' ? 'Add Order' : 'Edit Order'}
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
          initialValues={{ customer_id: '', store_id: '', total_amount: undefined, order_date: null }}
        >
          <Form.Item
            name="customer_id"
            label="Customer"
            rules={[{ required: true, message: 'Please select a customer!' }]}
          >
            <Select
              showSearch
              placeholder="Search for a customer"
              onSearch={handleCustomerSearch}
              loading={customerSearchLoading}
              filterOption={false}
              notFoundContent={customerSearchLoading ? <LoadingSpinner /> : null}
            >
              {searchedCustomers.map((customer) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name || customer.username} ({customer.username})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="store_id"
            label="Store"
            rules={[{ required: true, message: 'Please select a store!' }]}
          >
            <Select
              showSearch
              placeholder="Search for a store"
              onSearch={handleStoreSearch}
              loading={storeSearchLoading}
              filterOption={false}
              notFoundContent={storeSearchLoading ? <LoadingSpinner /> : null}
            >
              {searchedStores.map((store) => (
                <Option key={store.id} value={store.id}>
                  {store.name || store.name_store}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="total_amount"
            label="Total Amount"
            rules={commonRules.price}
          >
            <InputNumber
              placeholder="Enter total amount"
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              precision={2}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item
            name="order_date"
            label="Order Date"
          >
            <DatePicker
              style={{ width: '100%' }}
              showTime
              placeholder="Select order date and time"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Orders
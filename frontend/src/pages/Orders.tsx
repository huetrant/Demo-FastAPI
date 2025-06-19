import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, Form, Select, InputNumber, DatePicker, Typography, Space } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
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
import { formatDate, formatCurrency, commonRules } from '../utils'

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
    return `#${String(orderNum).padStart(4, '0')}`
  }

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`)
  }

  const columns: TableColumn<Order>[] = [
    {
      key: 'orderNumber',
      title: 'Order #',
      render: (_, __, index: number) => getOrderNumber(index),
    },
    {
      key: 'customer',
      title: 'Customer',
      dataIndex: 'customer_id',
      render: (customerId: string) => getCustomerName(customerId),
    },
    {
      key: 'store',
      title: 'Store',
      dataIndex: 'store_id',
      render: (storeId: string) => getStoreName(storeId),
    },
    {
      key: 'total_amount',
      title: 'Total',
      dataIndex: 'total_amount',
      render: (amount: number) => formatCurrency(amount),
      sorter: true,
    },
    {
      key: 'order_date',
      title: 'Date',
      dataIndex: 'order_date',
      render: (date: string) => formatDate(date),
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
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Orders</Title>
        <Text type="secondary">Manage customer orders and transactions</Text>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
          loading={createMutation.loading}
        >
          Add Order
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

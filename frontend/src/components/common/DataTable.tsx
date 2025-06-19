import React from 'react'
import { Table, TableProps as AntTableProps } from 'antd'
import { TableProps } from '../../client/types'

interface DataTableProps<T> extends TableProps<T> {
  emptyText?: string
  scroll?: { x?: number | string; y?: number | string }
  size?: 'small' | 'middle' | 'large'
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  rowKey = 'id',
  onRow,
  emptyText = 'No data available',
  scroll = { x: 800 },
  size = 'middle',
  ...props
}: DataTableProps<T>) {
  const antColumns = columns.map(col => ({
    key: col.key,
    title: col.title,
    dataIndex: col.dataIndex as string,
    render: col.render,
    sorter: col.sorter,
    width: col.width,
  }))

  const antPagination = pagination ? {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} items`,
    onChange: pagination.onChange,
    onShowSizeChange: pagination.onChange,
  } : false

  return (
    <Table
      columns={antColumns}
      dataSource={data}
      loading={loading}
      pagination={antPagination}
      rowKey={typeof rowKey === 'function' ? rowKey : (record) => record[rowKey as string]}
      onRow={onRow}
      scroll={scroll}
      size={size}
      locale={{ emptyText }}
      {...props}
    />
  )
}

export default DataTable

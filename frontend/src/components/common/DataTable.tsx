import { Table } from 'antd'
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

  const antPagination = pagination === false ? false : pagination ? {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} of ${total} items`,
    onChange: pagination.onChange,
    onShowSizeChange: pagination.onChange,
  } : undefined

  return (
    <>
      <style>
        {`
          /* Enhanced loading state */
          .ant-table-loading .ant-table-tbody > tr > td {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%) !important;
            background-size: 200% 100% !important;
            animation: loading-shimmer 1.5s infinite !important;
          }
          
          @keyframes loading-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
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
    </>
  )
}

export default DataTable

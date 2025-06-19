import { Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'

const { confirm } = Modal

export interface ConfirmDialogOptions {
  title: string
  content: string
  okText?: string
  cancelText?: string
  okType?: 'primary' | 'danger' | 'default'
  onOk: () => void | Promise<void>
  onCancel?: () => void
}

export const showConfirmDialog = (options: ConfirmDialogOptions) => {
  const {
    title,
    content,
    okText = 'OK',
    cancelText = 'Cancel',
    okType = 'primary',
    onOk,
    onCancel,
  } = options

  confirm({
    title,
    content,
    icon: <ExclamationCircleOutlined />,
    okText,
    cancelText,
    okType,
    onOk,
    onCancel,
  })
}

// Specific confirm dialogs
export const showDeleteConfirm = (
  itemName: string,
  onConfirm: () => void | Promise<void>
) => {
  showConfirmDialog({
    title: 'Delete Confirmation',
    content: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
    okText: 'Yes, Delete',
    okType: 'danger',
    onOk: onConfirm,
  })
}

export const showUpdateConfirm = (
  itemName: string,
  onConfirm: () => void | Promise<void>
) => {
  showConfirmDialog({
    title: 'Update Confirmation',
    content: `Are you sure you want to update "${itemName}"?`,
    okText: 'Yes, Update',
    onOk: onConfirm,
  })
}

export const showEditConfirm = (
  itemName: string,
  onConfirm: () => void | Promise<void>
) => {
  showConfirmDialog({
    title: 'Edit Confirmation',
    content: `Are you sure you want to edit "${itemName}"?`,
    okText: 'Yes, Edit',
    onOk: onConfirm,
  })
}
export const showError = (title: string, content: string) => {
  Modal.error({
    title,
    content,
    icon: <ExclamationCircleOutlined />,
  })
};

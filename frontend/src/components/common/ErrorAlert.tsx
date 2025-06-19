import React from 'react'
import { Alert, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

interface ErrorAlertProps {
  message?: string
  description?: string
  showIcon?: boolean
  type?: 'error' | 'warning' | 'info' | 'success'
  onRetry?: () => void
  retryText?: string
  style?: React.CSSProperties
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message = 'Error',
  description = 'Something went wrong. Please try again.',
  showIcon = true,
  type = 'error',
  onRetry,
  retryText = 'Retry',
  style,
}) => {
  const action = onRetry ? (
    <Button
      size="small"
      icon={<ReloadOutlined />}
      onClick={onRetry}
      type="primary"
      ghost
    >
      {retryText}
    </Button>
  ) : undefined

  return (
    <Alert
      message={message}
      description={description}
      type={type}
      showIcon={showIcon}
      action={action}
      style={style}
    />
  )
}

export default ErrorAlert

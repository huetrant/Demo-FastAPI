import React from 'react'
import { Spin } from 'antd'

interface LoadingSpinnerProps {
  tip?: string
  size?: 'small' | 'default' | 'large'
  spinning?: boolean
  children?: React.ReactNode
  style?: React.CSSProperties
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  tip = 'Loading...',
  size = 'default',
  spinning = true,
  children,
  style,
}) => {
  if (children) {
    return (
      <Spin tip={tip} size={size} spinning={spinning}>
        {children}
      </Spin>
    )
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px', ...style }}>
      <Spin tip={tip} size={size} spinning={spinning}>
        <div style={{ minHeight: '200px' }} />
      </Spin>
    </div>
  )
}

export default LoadingSpinner

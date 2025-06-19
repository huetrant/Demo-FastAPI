import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

// Date formatting
export const formatDate = (date: string | Date, format = 'MMM DD, YYYY') => {
  if (!date) return 'N/A'
  return dayjs(date).format(format)
}

export const formatDateTime = (date: string | Date) => {
  return formatDate(date, 'MMM DD, YYYY HH:mm')
}

export const formatRelativeTime = (date: string | Date) => {
  if (!date) return 'N/A'
  return dayjs(date).fromNow()
}

// Currency formatting
export const formatCurrency = (amount: number, currency = 'USD') => {
  if (typeof amount !== 'number') return '$0.00'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatPrice = (price: number) => {
  return formatCurrency(price)
}

// Number formatting
export const formatNumber = (num: number, decimals = 0) => {
  if (typeof num !== 'number') return '0'

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export const formatPercentage = (value: number, decimals = 1) => {
  if (typeof value !== 'number') return '0%'

  return `${formatNumber(value, decimals)}%`
}

// Text formatting
export const truncateText = (text: string, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export const capitalizeFirst = (text: string) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const formatName = (firstName?: string, lastName?: string) => {
  const parts = [firstName, lastName].filter(Boolean)
  return parts.join(' ') || 'N/A'
}

// ID formatting
export const formatId = (id: string, length = 8) => {
  if (!id) return 'N/A'
  return id.slice(-length)
}

// File size formatting
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// Phone number formatting
export const formatPhoneNumber = (phone: string) => {
  if (!phone) return 'N/A'

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '')

  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  return phone
}

// Address formatting
export const formatAddress = (address: string) => {
  if (!address) return 'N/A'
  return address
}

// Status formatting
export const formatStatus = (status: string) => {
  if (!status) return 'Unknown'
  return capitalizeFirst(status.replace(/_/g, ' '))
}

// Quantity formatting
export const formatQuantity = (quantity: number) => {
  if (typeof quantity !== 'number') return '0'
  return formatNumber(quantity, 0)
}

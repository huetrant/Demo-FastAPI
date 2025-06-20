import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React from 'react'
import {
  MedicineBoxOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FireOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  ExperimentOutlined,
  TrophyOutlined
} from '@ant-design/icons'

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
export const formatCurrency = (amount: number, currency = 'VND') => {
  if (typeof amount !== 'number') return '0 VND'

  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' VND'
  }

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

// Color scheme constants
export const COLOR_SCHEME = {
  GOOD: '#52c41a',      // Green - good/low values
  MEDIUM: '#fa8c16',    // Orange - medium values  
  BAD: '#f5222d',       // Red - bad/high values
  NEUTRAL: '#d9d9d9',   // Gray - no data
  DEFAULT: '#000000'    // Black - default text
} as const

// Icon definitions
export const ICONS = {
  // Vitamin icons
  vitaminA: () => React.createElement(React.Fragment, null, '🥕'),
  vitaminC: () => React.createElement(React.Fragment, null, '🍊'),

  // Sync icons
  sync: () => React.createElement(SyncOutlined, { style: { color: '#1890ff' } }),
  synced: () => React.createElement(CheckCircleOutlined, { style: { color: '#52c41a' } }),

  // Nutritional icons
  calories: () => React.createElement(FireOutlined, { style: { color: '#ff4d4f' } }),
  caffeine: () => React.createElement(ThunderboltOutlined, { style: { color: '#faad14' } }),
  protein: () => React.createElement(React.Fragment, null, '💪'),
  sugar: () => React.createElement(InfoCircleOutlined, { style: { color: '#1890ff' } }),
  fiber: () => React.createElement(ExperimentOutlined, { style: { color: '#722ed1' } }),
  salesRank: () => React.createElement(React.Fragment, null, '🏆'),

  // Other icons
  price: () => React.createElement(DollarOutlined, { style: { color: '#52c41a' } }),
  medicineBox: () => React.createElement(MedicineBoxOutlined, {})
}

// Vitamin icon formatter
export const formatVitaminIcon = (vitamin: 'vitaminA' | 'vitaminC') => {
  const IconComponent = ICONS[vitamin]
  return IconComponent ? IconComponent() : null
}

// Sync icon formatter
export const formatSyncIcon = (status: 'sync' | 'synced') => {
  const IconComponent = ICONS[status]
  return IconComponent ? IconComponent() : null
}

// Nutritional value color formatters (unchanged, but updated to use ICONS.vitaminA and vitaminC)
export const formatVitaminAWithIcon = (value?: number | string) => {
  if (!value) return { text: '-', icon: ICONS.vitaminA, color: COLOR_SCHEME.NEUTRAL }

  return {
    text: `${value}`,
    icon: ICONS.vitaminA,
    color: COLOR_SCHEME.BAD,
    style: { color: COLOR_SCHEME.BAD, fontWeight: 'bold' as const }
  }
}

export const formatVitaminCWithIcon = (value?: number | string) => {
  if (!value) return { text: '-', icon: ICONS.vitaminC, color: COLOR_SCHEME.NEUTRAL }

  return {
    text: `${value}`,
    icon: ICONS.vitaminC,
    color: COLOR_SCHEME.GOOD,
    style: { color: COLOR_SCHEME.GOOD, fontWeight: 'bold' as const }
  }
}

// Nutritional value formatters with color and icons
export const formatCaloriesWithColor = (value?: number) => {
  if (!value) return { text: '-', icon: ICONS.calories, style: { color: COLOR_SCHEME.NEUTRAL } }

  // Calories: lower is generally better for health
  let color: string = COLOR_SCHEME.GOOD // Low calories (good)
  if (value > 300) color = COLOR_SCHEME.BAD // High calories (bad)
  else if (value > 150) color = COLOR_SCHEME.MEDIUM // Medium calories

  return {
    text: `${value}`,
    icon: ICONS.calories,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatCaffeineWithColor = (value?: number) => {
  if (!value) return { text: '-', icon: ICONS.caffeine, style: { color: COLOR_SCHEME.NEUTRAL } }

  // Caffeine: moderate amounts are generally acceptable
  let color: string = COLOR_SCHEME.GOOD // Low caffeine (good)
  if (value > 200) color = COLOR_SCHEME.BAD // High caffeine (bad)
  else if (value > 100) color = COLOR_SCHEME.MEDIUM // Medium caffeine

  return {
    text: `${value}mg`,
    icon: ICONS.caffeine,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatSugarWithColor = (value?: number) => {
  if (!value) return { text: '-', icon: ICONS.sugar, style: { color: COLOR_SCHEME.NEUTRAL } }

  // Sugar: lower is better
  let color: string = COLOR_SCHEME.GOOD // Low sugar (good)
  if (value > 25) color = COLOR_SCHEME.BAD // High sugar (bad)
  else if (value > 15) color = COLOR_SCHEME.MEDIUM // Medium sugar

  return {
    text: `${value}g`,
    icon: ICONS.sugar,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatProteinWithColor = (value?: number) => {
  if (!value) return { text: '-', icon: ICONS.protein, style: { color: COLOR_SCHEME.NEUTRAL } }

  // Protein: higher is generally better
  let color: string = COLOR_SCHEME.MEDIUM // Medium protein
  if (value > 10) color = COLOR_SCHEME.GOOD // High protein (good)
  else if (value < 3) color = COLOR_SCHEME.BAD // Low protein (bad)

  return {
    text: `${value}g`,
    icon: ICONS.protein,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatFiberWithColor = (value?: number) => {
  if (!value) return { text: '-', icon: ICONS.fiber, style: { color: COLOR_SCHEME.NEUTRAL } }

  // Fiber: higher is generally better
  let color: string = COLOR_SCHEME.MEDIUM // Medium fiber
  if (value > 5) color = COLOR_SCHEME.GOOD // High fiber (good)
  else if (value < 2) color = COLOR_SCHEME.BAD // Low fiber (bad)

  return {
    text: `${value}g`,
    icon: ICONS.fiber,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatSalesRankWithColor = (value?: number) => {
  if (!value) return { text: '-', icon: ICONS.salesRank, style: { color: COLOR_SCHEME.NEUTRAL } }

  // Sales rank: lower number = better performance (1 is best)
  let color: string = COLOR_SCHEME.BAD // Lower ranks (6-10)
  if (value <= 3) color = COLOR_SCHEME.GOOD // Top 3 ranks (excellent)
  else if (value <= 5) color = COLOR_SCHEME.MEDIUM // Ranks 4-5 (good)

  return {
    text: `${value}`,
    icon: ICONS.salesRank,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatPriceWithColor = (value?: number) => {
  if (!value) return { text: '0 VND', icon: ICONS.price, style: { color: COLOR_SCHEME.NEUTRAL } }

  return {
    text: formatCurrency(value),
    icon: ICONS.price,
    style: { color: COLOR_SCHEME.GOOD, fontWeight: 'bold' as const }
  }
}

// Generic value formatter with custom configuration
export const formatValueWithColor = (
  value: number | undefined,
  config: {
    icon?: string
    unit?: string
    goodThreshold: number
    mediumThreshold: number
    higherIsBetter?: boolean
  }
) => {
  if (!value) return { text: '-', style: { color: COLOR_SCHEME.NEUTRAL } }

  const { goodThreshold, mediumThreshold, higherIsBetter = true, unit = '', icon = '' } = config

  let color: string = COLOR_SCHEME.MEDIUM
  if (higherIsBetter) {
    if (value >= goodThreshold) color = COLOR_SCHEME.GOOD
    else if (value < mediumThreshold) color = COLOR_SCHEME.BAD
  } else {
    if (value <= goodThreshold) color = COLOR_SCHEME.GOOD
    else if (value > mediumThreshold) color = COLOR_SCHEME.BAD
  }

  return {
    text: `${icon}${value}${unit}`,
    style: { color, fontWeight: 'bold' as const }
  }
}

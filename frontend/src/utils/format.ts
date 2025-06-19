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

// Nutritional value color formatters
export const formatCaloriesWithColor = (calories?: number) => {
  if (!calories) return { text: '-', color: COLOR_SCHEME.NEUTRAL }

  let color: string = COLOR_SCHEME.GOOD // Low calories (good)
  if (calories > 300) color = COLOR_SCHEME.BAD // High calories (bad)
  else if (calories > 150) color = COLOR_SCHEME.MEDIUM // Medium calories

  return {
    text: `🔥 ${calories}`,
    color,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatCaffeineWithColor = (caffeine?: number) => {
  if (!caffeine) return { text: '-', color: COLOR_SCHEME.NEUTRAL }

  let color: string = COLOR_SCHEME.GOOD // Low caffeine (good)
  if (caffeine > 150) color = COLOR_SCHEME.BAD // High caffeine (bad)
  else if (caffeine > 75) color = COLOR_SCHEME.MEDIUM // Medium caffeine

  return {
    text: `⚡ ${caffeine}`,
    color,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatSugarWithColor = (sugar?: number) => {
  if (!sugar) return { text: '-', color: COLOR_SCHEME.NEUTRAL }

  let color: string = COLOR_SCHEME.GOOD // Low sugar (good)
  if (sugar > 25) color = COLOR_SCHEME.BAD // High sugar (bad)
  else if (sugar > 15) color = COLOR_SCHEME.MEDIUM // Medium sugar

  return {
    text: `🍯 ${sugar}`,
    color,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatProteinWithColor = (protein?: number) => {
  if (!protein) return { text: '-', color: COLOR_SCHEME.NEUTRAL }

  // For protein, higher is generally better
  let color: string = COLOR_SCHEME.BAD // Low protein (bad)
  if (protein >= 15) color = COLOR_SCHEME.GOOD // High protein (good)
  else if (protein >= 8) color = COLOR_SCHEME.MEDIUM // Medium protein

  return {
    text: `💪 ${protein}`,
    color,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatFiberWithColor = (fiber?: number) => {
  if (!fiber) return { text: '-', color: COLOR_SCHEME.NEUTRAL }

  // For fiber, higher is generally better
  let color: string = COLOR_SCHEME.BAD // Low fiber (bad)
  if (fiber >= 5) color = COLOR_SCHEME.GOOD // High fiber (good)
  else if (fiber >= 2) color = COLOR_SCHEME.MEDIUM // Medium fiber

  return {
    text: `🌾 ${fiber}`,
    color,
    style: { color, fontWeight: 'bold' as const }
  }
}

export const formatSalesRankWithColor = (rank?: number) => {
  if (!rank) return { text: '-', color: COLOR_SCHEME.NEUTRAL }

  // Sales rank only goes from 1-10, lower number = better performance
  let color: string = COLOR_SCHEME.BAD // Lower ranks (6-10)
  if (rank <= 3) color = COLOR_SCHEME.GOOD // Top 3 ranks (excellent)
  else if (rank <= 5) color = COLOR_SCHEME.MEDIUM // Ranks 4-5 (good)

  return {
    text: `🏆 ${rank}`,
    color,
    style: { color, fontWeight: 'bold' as const }
  }
}

// Generic value formatter with color based on thresholds
export const formatValueWithColor = (
  value: number | undefined,
  config: {
    icon?: string
    unit?: string
    goodThreshold: number
    mediumThreshold: number
    higherIsBetter?: boolean // Default: false (lower is better)
  }
) => {
  if (!value) return { text: '-', color: COLOR_SCHEME.NEUTRAL }

  const { icon = '', unit = '', goodThreshold, mediumThreshold, higherIsBetter = false } = config

  let color: string
  if (higherIsBetter) {
    // Higher values are better (e.g., protein, fiber)
    if (value >= goodThreshold) color = COLOR_SCHEME.GOOD
    else if (value >= mediumThreshold) color = COLOR_SCHEME.MEDIUM
    else color = COLOR_SCHEME.BAD
  } else {
    // Lower values are better (e.g., calories, sugar, caffeine)
    if (value <= goodThreshold) color = COLOR_SCHEME.GOOD
    else if (value <= mediumThreshold) color = COLOR_SCHEME.MEDIUM
    else color = COLOR_SCHEME.BAD
  }

  return {
    text: `${icon}${value}${unit}`.trim(),
    color,
    style: { color, fontWeight: 'bold' as const }
  }
}

// Price/Currency formatter with color based on amount
export const formatPriceWithColor = (amount?: number) => {
  if (!amount) return { text: '0 VND', color: COLOR_SCHEME.NEUTRAL }

  // For price, higher amounts get different colors (higher is better for business)
  let color: string = COLOR_SCHEME.BAD // Low value orders (red)
  if (amount >= 100) color = COLOR_SCHEME.GOOD // High value orders (green)
  else if (amount >= 50) color = COLOR_SCHEME.MEDIUM // Medium value orders (orange)

  const formattedAmount = formatCurrency(amount)

  return {
    text: `💰 ${formattedAmount}`,
    color,
    style: { color, fontWeight: 'bold' as const }
  }
}

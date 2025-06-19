import React from 'react'
import {
  formatCaloriesWithColor,
  formatCaffeineWithColor,
  formatSugarWithColor,
  formatProteinWithColor,
  formatFiberWithColor,
  formatSalesRankWithColor,
  formatValueWithColor,
  formatPriceWithColor
} from './format'

// React components for easy reuse in table columns
export const CaloriesCell: React.FC<{ calories?: number }> = ({ calories }) => {
  const formatted = formatCaloriesWithColor(calories)
  return <span style={formatted.style}> {formatted.text} </span>
}

export const CaffeineCell: React.FC<{ caffeine?: number }> = ({ caffeine }) => {
  const formatted = formatCaffeineWithColor(caffeine)
  return <span style={formatted.style}> {formatted.text} </span>
}

export const SugarCell: React.FC<{ sugar?: number }> = ({ sugar }) => {
  const formatted = formatSugarWithColor(sugar)
  return <span style={formatted.style}> {formatted.text} </span>
}

export const ProteinCell: React.FC<{ protein?: number }> = ({ protein }) => {
  const formatted = formatProteinWithColor(protein)
  return <span style={formatted.style}> {formatted.text} </span>
}

export const FiberCell: React.FC<{ fiber?: number }> = ({ fiber }) => {
  const formatted = formatFiberWithColor(fiber)
  return <span style={formatted.style}> {formatted.text} </span>
}

export const SalesRankCell: React.FC<{ rank?: number }> = ({ rank }) => {
  const formatted = formatSalesRankWithColor(rank)
  return <span style={formatted.style}> {formatted.text} </span>
}

// Generic value cell with custom configuration
export const ValueCell: React.FC<{
  value?: number
  config: {
    icon?: string
    unit?: string
    goodThreshold: number
    mediumThreshold: number
    higherIsBetter?: boolean
  }
}> = ({ value, config }) => {
  const formatted = formatValueWithColor(value, config)
  return <span style={formatted.style}> {formatted.text} </span>
}

// Price cell with color formatting
export const PriceCell: React.FC<{ amount?: number }> = ({ amount }) => {
  const formatted = formatPriceWithColor(amount)
  return <span style={formatted.style}> {formatted.text} </span>
}

// Table column generators for common use cases
export const createNutritionalColumns = () => [
  {
    title: 'Calories',
    dataIndex: 'calories',
    key: 'calories',
    sorter: (a: any, b: any) => (a.calories || 0) - (b.calories || 0),
    render: (calories: number) => <CaloriesCell calories={calories} />
  },
  {
    title: 'Caffeine (mg)',
    dataIndex: 'caffeine_mg',
    key: 'caffeine',
    sorter: (a: any, b: any) => (a.caffeine_mg || 0) - (b.caffeine_mg || 0),
    render: (caffeine: number) => <CaffeineCell caffeine={caffeine} />
  },
  {
    title: 'Sugar (g)',
    dataIndex: 'sugars_g',
    key: 'sugar',
    sorter: (a: any, b: any) => (a.sugars_g || 0) - (b.sugars_g || 0),
    render: (sugar: number) => <SugarCell sugar={sugar} />
  },
  {
    title: 'Protein (g)',
    dataIndex: 'protein_g',
    key: 'protein',
    sorter: (a: any, b: any) => (a.protein_g || 0) - (b.protein_g || 0),
    render: (protein: number) => <ProteinCell protein={protein} />
  },
  {
    title: 'Fiber (g)',
    dataIndex: 'dietary_fiber_g',
    key: 'fiber',
    sorter: (a: any, b: any) => (a.dietary_fiber_g || 0) - (b.dietary_fiber_g || 0),
    render: (fiber: number) => <FiberCell fiber={fiber} />
  },
  {
    title: 'Sales Rank',
    dataIndex: 'sales_rank',
    key: 'sales_rank',
    sorter: (a: any, b: any) => (a.sales_rank || 0) - (b.sales_rank || 0),
    render: (rank: number) => <SalesRankCell rank={rank} />
  }
]

// For variant-based data (nested structure)
export const createVariantNutritionalColumns = () => [
  {
    title: 'Calories',
    dataIndex: 'variant',
    key: 'calories',
    sorter: (a: any, b: any) => (a.variant?.calories || 0) - (b.variant?.calories || 0),
    render: (variant: any) => <CaloriesCell calories={variant?.calories} />
  },
  {
    title: 'Caffeine (mg)',
    dataIndex: 'variant',
    key: 'caffeine',
    sorter: (a: any, b: any) => (a.variant?.caffeine_mg || 0) - (b.variant?.caffeine_mg || 0),
    render: (variant: any) => <CaffeineCell caffeine={variant?.caffeine_mg} />
  },
  {
    title: 'Sugar (g)',
    dataIndex: 'variant',
    key: 'sugar',
    sorter: (a: any, b: any) => (a.variant?.sugars_g || 0) - (b.variant?.sugars_g || 0),
    render: (variant: any) => <SugarCell sugar={variant?.sugars_g} />
  },
  {
    title: 'Protein (g)',
    dataIndex: 'variant',
    key: 'protein',
    sorter: (a: any, b: any) => (a.variant?.protein_g || 0) - (b.variant?.protein_g || 0),
    render: (variant: any) => <ProteinCell protein={variant?.protein_g} />
  },
  {
    title: 'Fiber (g)',
    dataIndex: 'variant',
    key: 'fiber',
    sorter: (a: any, b: any) => (a.variant?.dietary_fiber_g || 0) - (b.variant?.dietary_fiber_g || 0),
    render: (variant: any) => <FiberCell fiber={variant?.dietary_fiber_g} />
  },
  {
    title: 'Sales Rank',
    dataIndex: 'variant',
    key: 'sales_rank',
    sorter: (a: any, b: any) => (a.variant?.sales_rank || 0) - (b.variant?.sales_rank || 0),
    render: (variant: any) => <SalesRankCell rank={variant?.sales_rank} />
  }
]

// Usage examples:
/*
// Example 1: Direct usage in a table
const columns = [
  ...otherColumns,
  ...createNutritionalColumns()
]

// Example 2: Individual cell usage
<CaloriesCell calories={variant.calories} />
<CaffeineCell caffeine={variant.caffeine_mg} />

// Example 3: Custom value with configuration
<ValueCell 
  value={variant.sodium_mg} 
  config={{
    icon: '🧂 ',
    unit: 'mg',
    goodThreshold: 100,
    mediumThreshold: 200,
    higherIsBetter: false
  }}
/>

// Example 4: In OrderDetail page (variant-based data)
const columns = [
  ...otherColumns,
  ...createVariantNutritionalColumns()
]
*/
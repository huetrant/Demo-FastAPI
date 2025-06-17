export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  descriptions: string | null;
  link_image: string | null;
  categories_id: string;
  variants?: Variant[];
}

export interface ProductsResponse {
  data: Product[];
  count: number;
}

export interface Variant {
  id: string;
  product_id: string;
  beverage_option?: string;
  calories?: number;
  dietary_fibre_g?: number;
  sugars_g?: number;
  protein_g?: number;
  vitamin_a?: string;
  vitamin_c?: string;
  caffeine_mg?: number;
  price?: number;
  sales_rank?: number;
}

export interface Customer {
  id: string;
  name?: string;
  sex?: string;
  age?: number;
  location?: string;
  picture?: string;
  embedding?: string;
  username?: string;
  password?: string;
}

export interface Store {
  id: string;
  name?: string; // Frontend convenience field
  name_store?: string; // Backend field
  address?: string;
  phone?: string;
  open_close?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  store_id: string;
  order_date?: string;
  total_amount?: number;
  order_details?: OrderDetail[];
}

export interface OrderDetail {
  id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  rate?: number;
  unit_price?: number;
  price?: number; // Frontend convenience field
}

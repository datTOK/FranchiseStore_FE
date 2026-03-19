export interface Product {
  id: number
  category_id: number
  category_name: string
  recipe_id: number
  name: string
  sku: string
  image_url: string | null
  uom: string
  unit_price: string
  product_type: 'FINISHED' | 'RAW_MATERIAL'
  is_active: number
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

export interface ProductListResponse {
  data: Product[]
}

export interface CreateProductPayload {
  category_id: number
  name: string
  image_url?: string
  uom: string
}

export interface UpdateProductPayload {
  category_id: number
  name: string
  image_url?: string
  uom: string
  is_active: boolean
}

export interface SetUnitPricePayload {
  unit_price: number
}
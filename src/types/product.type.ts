export interface Product {
  id: number
  category_id: number
  category_name: string
  name: string
  sku: string
  image_url: string | null
  uom: string
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
  product_type: 'FINISHED' | 'RAW_MATERIAL'
}

export interface UpdateProductPayload {
  category_id: number
  name: string
  image_url?: string
  uom: string
  product_type: 'FINISHED' | 'RAW_MATERIAL'
  is_active: boolean
}
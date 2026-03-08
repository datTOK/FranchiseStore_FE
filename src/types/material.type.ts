export interface Material {
  id: number
  name: string
  sku: string
  unit: string
  description: string
  created_by: number
  created_at: string
  updated_at: string
  created_by_name: string
}

export interface CreateMaterialPayload {
  name: string
  unit: string
  description: string
}

export interface MaterialResponse {
  data: Material[]
  message: string
}
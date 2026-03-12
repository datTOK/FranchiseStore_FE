export interface MaterialBatch {
  id: number
  batch_code: string
  material_id: number
  store_id: number
  quantity: string
  unit: string
  supplier_name: string
  received_date: string
  created_by: number
  created_at: string
  updated_at: string
  notes: string
  status: "PENDING" | "RECEIVED"
  material_name: string
  material_sku: string
  store_name: string
  created_by_name: string
}

export interface MaterialBatchResponse {
  data: MaterialBatch[]
}

export interface MaterialBatchParams {
  store_id?: number
  material_id?: number
  date_from?: string
  date_to?: string
}

export interface CreateMaterialBatchPayload {
  material_id: number
  quantity: number
  unit: string
  supplier_name: string
  received_date: string
  notes?: string
}

export interface CreateMaterialBatchResponse {
  success: boolean
  data: {
    id: number
    batch_code: string
    material_id: number
    store_id: number
    quantity: number
    status: "PENDING"
    created_at: string
  }
  message: string
}
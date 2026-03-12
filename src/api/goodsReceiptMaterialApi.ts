import axiosClient from "./axiosClient";

export type GoodsReceiptMaterialStatus =
  | "PENDING"
  | "COMPLETED"
  | "REJECTED"
  | string;

export type GoodsReceiptMaterialItem = {
  material_id?: number;
  material_name?: string;
  material_sku?: string;
  material_batch_id?: number;
  batch_code?: string;
  quantity: number | string;
  unit?: string;
};

export type GoodsReceiptMaterialRow = {
  id: number;
  receipt_code?: string;
  supplier_id?: number | null;
  supplier_name?: string;
  status: GoodsReceiptMaterialStatus;
  notes?: string;
  created_by?: number | null;
  created_by_name?: string | null;
  confirmed_by?: number | null;
  received_by?: number | null;
  received_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
  store_name?: string | null;

  material_id?: number;
  material_name?: string;
  material_sku?: string;
  material_batch_id?: number;
  batch_code?: string;
  received_quantity?: number | string;
  unit?: string;
};

export type GoodsReceiptMaterialDetail = {
  id: number;
  receipt_code?: string;
  supplier_id?: number | null;
  supplier_name?: string;
  status: GoodsReceiptMaterialStatus;
  notes?: string;
  created_by?: number | null;
  created_by_name?: string | null;
  confirmed_by?: number | null;
  received_by?: number | null;
  received_by_name?: string | null;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
  store_name?: string | null;
  items: GoodsReceiptMaterialItem[];
};

export type ApiListResponse<T> = {
  data: T[];
};

export type ApiDetailResponse<T> = {
  data: T;
};

export type GoodsReceiptMaterialActionBody = {
  notes: string;
};

const goodsReceiptMaterialApi = {
  getAll() {
    return axiosClient.get<ApiListResponse<GoodsReceiptMaterialRow>>(
      "/goods-receipt-materials"
    );
  },

  getById(id: number) {
    return axiosClient.get<ApiDetailResponse<GoodsReceiptMaterialRow>>(
      `/goods-receipt-materials/${id}`
    );
  },

  complete(id: number, payload: GoodsReceiptMaterialActionBody) {
    return axiosClient.patch(
      `/goods-receipt-materials/${id}/complete`,
      payload
    );
  },

  reject(id: number, payload: GoodsReceiptMaterialActionBody) {
    return axiosClient.patch(
      `/goods-receipt-materials/${id}/reject`,
      payload
    );
  },
};

export default goodsReceiptMaterialApi;
import axiosClient from "./axiosClient";

export type GoodsReceiptMaterialStatus =
  | "PENDING"
  | "COMPLETED"
  | "REJECTED"
  | string;

export type GoodsReceiptMaterialItem = {
  material_id: number;
  material_name?: string;
  quantity: number | string;
  unit?: string;
};

export type GoodsReceiptMaterialRow = {
  id: number;
  receipt_code?: string;
  supplier_id?: number;
  material_inventory_id?: number;
  status: GoodsReceiptMaterialStatus;
  created_by?: number | null;
  confirmed_by?: number | null;
  created_at?: string;
  updated_at?: string;
  items?: GoodsReceiptMaterialItem[];
};

export type GoodsReceiptMaterialDetail = GoodsReceiptMaterialRow;

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
    return axiosClient.get<ApiDetailResponse<GoodsReceiptMaterialDetail>>(
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
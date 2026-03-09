import axiosClient from "./axiosClient";

export type MaterialBatchStatus = "RECEIVED" | string;

export type MaterialInventoryBatch = {
  id: number;
  batch_id: number;
  batch_code: string;
  sequence: number;
  quantity: number | string;
  unit: string;
  supplier_name?: string;
  received_date?: string;
  status: MaterialBatchStatus;
};

export type MaterialInventoryRow = {
  material_id: number;
  material_name: string;
  material_sku: string;
  unit: string;
  total_quantity: number | string;
  batch_count: number;
  batches: MaterialInventoryBatch[];
};

export type MaterialInventoryListResponse = {
  data: MaterialInventoryRow[];
  message?: string;
};

const materialInventoryApi = {
  getAll() {
    return axiosClient.get<MaterialInventoryListResponse>("/material-inventory");
  },

  getByMaterialId(materialId: number) {
    return axiosClient.get<{ data: MaterialInventoryRow }>(
      `/material-inventory/material/${materialId}`
    );
  },

  getByStoreId(storeId: number) {
    return axiosClient.get<MaterialInventoryListResponse>(
      `/material-inventory/store/${storeId}`
    );
  },

  getLowStock() {
    return axiosClient.get<MaterialInventoryListResponse>("/material-inventory/low-stock");
  },

  getEmptyStock() {
    return axiosClient.get<MaterialInventoryListResponse>("/material-inventory/empty-stock");
  },
};

export default materialInventoryApi;
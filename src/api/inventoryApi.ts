import axiosClient from "./axiosClient";

export type ProductType = "RAW_MATERIAL" | "SEMI_FINISHED" | "FINISHED";

// GET /inventory
export interface InventoryItemApi {
  id: number;
  store_id: number;
  product_id: number;
  name: string;
  sku: string;
  uom: string;
  product_type: ProductType;
  category_id: number;
  quantity: number | string;
  reserved_quantity: number | string;
  available_quantity: number | string;
  updated_at: string;
}

export interface InventoryListResponse {
  data: InventoryItemApi[];
  message?: string;
}

export async function getInventory() {
  const res = await axiosClient.get<InventoryListResponse>("/inventory");
  return res.data;
}

export async function getInventorySummary() {
  const res = await axiosClient.get("/inventory/summary");
  return res.data;
}

export async function getInventoryItem(productId: number) {
  const res = await axiosClient.get(`/inventory/${productId}`);
  return res.data;
}

const inventoryApi = {
  getAll: getInventory,
  getSummary: getInventorySummary,
  getOne: getInventoryItem,
};

export default inventoryApi;
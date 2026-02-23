import axiosClient from "./axiosClient";

export type ProductType = "RAW_MATERIAL" | "SEMI_FINISHED" | "FINISHED";

export interface ProductItem {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  sku: string;
  image_url: string | null;
  uom: string;
  product_type: ProductType;
  is_active: number;
  created_at: string;
  updated_at: string;
  created_by: any;
  updated_by: any;
}

export interface ProductListResponse {
  data: ProductItem[];
}

const inventoryApi = {
  getAll: () => axiosClient.get<ProductListResponse>("/products"),
};

export default inventoryApi;
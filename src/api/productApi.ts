import axiosClient from "./axiosClient";
import type { ProductType } from "./inventoryApi";

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
  message?: string;
}

export async function getProducts() {
  const res = await axiosClient.get<ProductListResponse>("/products");
  return res.data;
}

const productApi = {
  getAll: getProducts,
};

export default productApi;
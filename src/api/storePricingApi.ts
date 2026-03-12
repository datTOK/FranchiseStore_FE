import axiosClient from "./axiosClient";

export type StorePricingRow = {
  id?: number;
  store_id?: number;
  product_id: number;
  product_name?: string;
  product_sku?: string;
  unit_price?: number | string;
  sale_price?: number | string;
  profit_per_unit?: number | string;
  profit_margin?: number | string;
  effective_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type StorePricingListResponse = {
  data: StorePricingRow[];
  message?: string;
};

export type StorePricingDetailResponse = {
  data: StorePricingRow;
  message?: string;
};

export type SetSalePricePayload = {
  sale_price: number;
};

const storePricingApi = {
  getAll() {
    return axiosClient.get<StorePricingListResponse>("/store-pricing");
  },

  getOne(productId: number) {
    return axiosClient.get<StorePricingDetailResponse>(`/store-pricing/${productId}`);
  },

  setSalePrice(productId: number, payload: SetSalePricePayload) {
    return axiosClient.patch(`/store-pricing/${productId}/set-sale-price`, payload);
  },
};

export default storePricingApi;
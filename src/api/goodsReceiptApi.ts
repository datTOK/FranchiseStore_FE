import axiosClient from "./axiosClient";

export type GoodsReceiptStatus = "CREATED" | "CONFIRMED" | string;

export type GoodsReceiptRow = {
  id: number;
  receipt_code: string;
  goods_issue_id: number;
  order_id: number;
  store_id: number;
  status: GoodsReceiptStatus;
  created_by?: number | null;
  confirmed_by?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type GoodsReceiptItem = {
  product_id: number;
  quantity: number | string;
};

export type GoodsReceiptDetail = GoodsReceiptRow & {
  items?: GoodsReceiptItem[];
};

export type GetGoodsReceiptsResponse = {
  data: GoodsReceiptRow[];
  message?: string;
};

export type GetGoodsReceiptDetailResponse = {
  data: GoodsReceiptDetail;
  message?: string;
};

const goodsReceiptApi = {
  getAll() {
    return axiosClient.get<GetGoodsReceiptsResponse>("/goods-receipts");
  },

  getById(id: number) {
    return axiosClient.get<GetGoodsReceiptDetailResponse>(`/goods-receipts/${id}`);
  },

  confirm(id: number) {
    return axiosClient.patch(`/goods-receipts/${id}/confirm`);
  },
};

export default goodsReceiptApi;
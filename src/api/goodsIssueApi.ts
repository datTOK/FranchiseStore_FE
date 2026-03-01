import axiosClient from "./axiosClient";

export type GoodsIssueStatus = "CREATED" | "COMPLETED" | string;

export type GoodsIssueRow = {
  id: number;
  issue_code: string;
  order_id: number;
  store_from: number;
  store_to: number;
  status: GoodsIssueStatus;
  created_by?: number | null;
  completed_by?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type GoodsIssueItemInput = {
  product_id: number;
  quantity: number;
};

export type CreateGoodsIssuePayload = {
  order_id: number;
  store_to: number;
  items: GoodsIssueItemInput[];
};

export type GetGoodsIssuesResponse = {
  data: GoodsIssueRow[];
  message?: string;
};

const goodsIssueApi = {
  getAll() {
    return axiosClient.get<GetGoodsIssuesResponse>("/goods-issues");
  },

  create(payload: CreateGoodsIssuePayload) {
    return axiosClient.post("/goods-issues", payload);
  },

  complete(id: number) {
    return axiosClient.patch(`/goods-issues/${id}/complete`);
  },
};

export default goodsIssueApi;
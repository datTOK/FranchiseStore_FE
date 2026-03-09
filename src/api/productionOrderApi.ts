import axiosClient from "./axiosClient";

export type ProductionOrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export type ProductionOrderRow = {
  id: number;
  order_code: string;
  recipe_id: number;
  product_id: number;
  store_id: number;
  target_quantity: number | string;
  target_unit: string;
  actual_quantity?: number | string;
  status: ProductionOrderStatus;
  target_date?: string;
  completed_date?: string;
  created_by?: number | null;
  updated_at?: string;
  created_at?: string;
  recipe_name?: string;
  product_name?: string;
  store_name?: string;
  created_by_name?: string;
  material_count?: number;
};

export type ProductionOrderDetail = ProductionOrderRow & {
  materials?: Array<{
    material_id?: number;
    material_name?: string;
    required_quantity?: number | string;
    allocated_quantity?: number | string;
    unit?: string;
  }>;
};

export type CreateProductionOrderPayload = {
  recipe_id: number;
  target_quantity: number;
  target_unit: string;
  target_date: string;
};

export type StartProductionPayload = {
  notes: string;
};

export type CompleteProductionPayload = {
  actual_quantity: number;
};

export type CancelProductionPayload = {
  notes: string;
};

export type ApiListResponse<T> = {
  data: T[];
};

export type ApiDetailResponse<T> = {
  data: T;
};

const productionOrderApi = {
  getAll() {
    return axiosClient.get<ApiListResponse<ProductionOrderRow>>("/production-orders");
  },

  getById(id: number) {
    return axiosClient.get<ApiDetailResponse<ProductionOrderDetail>>(
      `/production-orders/${id}`
    );
  },

  create(payload: CreateProductionOrderPayload) {
    return axiosClient.post<ApiDetailResponse<ProductionOrderDetail>>(
      "/production-orders",
      payload
    );
  },

  start(id: number, payload: StartProductionPayload) {
    return axiosClient.patch(`/production-orders/${id}/start`, payload);
  },

  complete(id: number, payload: CompleteProductionPayload) {
    return axiosClient.patch(`/production-orders/${id}/complete`, payload);
  },

  cancel(id: number, payload: CancelProductionPayload) {
    return axiosClient.patch(`/production-orders/${id}/cancel`, payload);
  },
};

export default productionOrderApi;
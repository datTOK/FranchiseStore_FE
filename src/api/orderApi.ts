import axiosClient from "./axiosClient";

export type OrderStatus = "SUBMITTED" | "CONFIRMED" | "ISSUED" | "DELIVERED" | string;

export type OrderRow = {
  id: number;
  order_code: string;
  store_id: number;
  order_date: string;
  delivery_date: string;
  status: OrderStatus;
  total_amount: string | number;
  created_by: number | null;
  confirmed_by: number | null;
  issued_by: number | null;
  created_at?: string;
  updated_at?: string;
};

export type OrderItemRow = {
  order_item_id: number;
  product_id: number;
  product_name: string;
  quantity: string | number;
  unit_price: string | number;
  total_price: string | number;
};

export type OrderDetail = OrderRow & {
  items?: OrderItemRow[];
};

export type GetOrdersResponse = {
  data: OrderRow[];
  message?: string;
};

export type GetOrderDetailResponse = {
  data: OrderDetail;
  message?: string;
};

export type CreateOrderPayload = {
  delivery_date: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
  }>;
};

export type CreateOrderResponse = {
  data: OrderDetail;
  message?: string;
};

export async function getOrders() {
  const res = await axiosClient.get<GetOrdersResponse>("/orders");
  return res.data;
}

export async function getOrderDetail(id: number) {
  const res = await axiosClient.get<GetOrderDetailResponse>(`/orders/${id}`);
  return res.data;
}

export async function createOrder(payload: CreateOrderPayload) {
  const res = await axiosClient.post<CreateOrderResponse>("/orders", payload);
  return res.data;
}

export async function confirmOrder(id: number) {
  const res = await axiosClient.patch(`/orders/${id}/confirm`);
  return res.data;
}

export async function issueOrder(id: number) {
  const res = await axiosClient.patch(`/orders/${id}/issue`);
  return res.data;
}

export async function deliverOrder(id: number) {
  const res = await axiosClient.patch(`/orders/${id}/deliver`);
  return res.data;
}

const orderApi = {
  getAll: getOrders,
  getById: getOrderDetail,
  create: createOrder,
  confirm: confirmOrder,
  issue: issueOrder,
  deliver: deliverOrder,
};

export default orderApi;
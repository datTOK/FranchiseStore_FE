import axiosClient from "./axiosClient";

export type ReservationItemInput = {
  product_id: number;
  quantity: number;
};

export type CreateReservationPayload = {
  order_id?: number; 
  items: ReservationItemInput[];
};

export type ReservationResponse = {
  id: number;
  order_id?: number;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
};

const reservationApi = {
  create(payload: CreateReservationPayload) {
    return axiosClient.post<ReservationResponse>("/reservations", payload);
  },

  complete(id: number) {
    return axiosClient.patch<ReservationResponse>(`/reservations/${id}/complete`);
  },
};

export default reservationApi;
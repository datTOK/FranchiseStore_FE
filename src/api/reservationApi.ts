import axiosClient from "./axiosClient";

export type ReservationItemInput = {
  product_id: number;
  quantity: number;
};

export type CreateReservationPayload = {
  order_id?: number; 
  items: ReservationItemInput[];
};

export type ReservationResponse = any;

const reservationApi = {
  create(payload: CreateReservationPayload) {
    return axiosClient.post<ReservationResponse>("/reservations", payload);
  },

  complete(id: number) {
    return axiosClient.patch<ReservationResponse>(`/reservations/${id}/complete`);
  },
};

export default reservationApi;
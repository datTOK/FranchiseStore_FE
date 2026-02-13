import axiosClient from "./axiosClient"
import type { Store } from "../types/store.type"

export const storeApi = {
  // GET all stores
  getAll: () => {
    return axiosClient.get<{ data: Store[] }>("/stores")
  },

  createStore: (body: Omit<Store, "id">) => {
    return axiosClient.post("/stores", body)
  },

  updateStore: (id: number, body: Partial<Store>) => {
    return axiosClient.put(`/stores/${id}`, body)
  },

  deleteStore: (id: number) => {
    return axiosClient.delete(`/stores/${id}`)
  },
}

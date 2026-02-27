import axiosClient from "./axiosClient"
import type { CreateProductPayload, ProductListResponse, UpdateProductPayload } from "../types/product.type"

export const productApi = {
  getAll: () => {
    return axiosClient.get<ProductListResponse>("/products")
  },
  createProduct: (body: CreateProductPayload) => {
    return axiosClient.post("/products", body)
  },
  updateProduct: (id: number, body: UpdateProductPayload) => {
    return axiosClient.put(`/products/${id}`, body)
  },
  deleteProduct: (id: number) => {
    return axiosClient.delete(`/products/${id}`)
  },
}

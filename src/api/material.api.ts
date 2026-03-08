import type { CreateMaterialPayload, Material, MaterialResponse } from "../types/material.type"
import axiosClient from "./axiosClient"


export const materialApi = {
    getAll: async (): Promise<Material[]> => {
        const res = await axiosClient.get<MaterialResponse>("/materials")
        return res.data.data
    },

    createMaterial: (payload: CreateMaterialPayload) =>
        axiosClient.post("/materials", payload),
}
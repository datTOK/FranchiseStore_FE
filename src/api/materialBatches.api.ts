import type { CreateMaterialBatchPayload, CreateMaterialBatchResponse, MaterialBatchParams, MaterialBatchResponse } from "../types/materialBatch.type";
import axiosClient from "./axiosClient";

export const materialBatchApi = {
    getAll: (params?: MaterialBatchParams) =>
        axiosClient.get<MaterialBatchResponse>("/material-batches", {
            params,
        }),
    createBatch: (data: CreateMaterialBatchPayload) =>
        axiosClient.post<CreateMaterialBatchResponse>(
            "/material-batches",
            {
                ...data,
                store_id: 1 
            }
        ),
}
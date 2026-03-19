import type { CreateProductRecipePayload, CreateProductRecipeResponse, ProductRecipeDetailResponse, ProductRecipeResponse } from "../types/productRecipe"
import axiosClient from "./axiosClient"

export const productRecipeApi = {
    getAll: (params?: {
        category_id?: number
        product_id?: number
        status?: "ACTIVE" | "INACTIVE"
        search?: string
    }) =>
        axiosClient.get<ProductRecipeResponse>("/product-recipes", {
            params,
        }),
    getDetail: (id: number) =>
        axiosClient.get<ProductRecipeDetailResponse>(
            `/product-recipes/${id}`
        ),
    create: async (payload: CreateProductRecipePayload): Promise<CreateProductRecipeResponse> => {
        const res = await axiosClient.post<CreateProductRecipeResponse>(
            "/product-recipes",
            payload
        )
        return res.data
    },
    // addIngredient: (
    //     recipeId: number,
    //     payload: {
    //         material_id: number
    //         quantity: number
    //         quantity_unit: string
    //         notes?: string
    //     }
    // ) =>
    //     axiosClient.post(
    //         `/product-recipes/${recipeId}/ingredients`,
    //         payload
    //     ),
    // updateIngredient: (
    //     recipeId: number,
    //     ingredientId: number,
    //     payload: {
    //         quantity?: number
    //         quantity_unit?: string
    //         notes?: string
    //     }
    // ) =>
    //     axiosClient.patch(
    //         `/product-recipes/${recipeId}/ingredients/${ingredientId}`,
    //         payload
    //     ),
    updateRecipe: (
        recipeId: number,
        payload: {
            name?: string
            yield_quantity?: number
            yield_unit?: string
            status?: string
            ingredients?: {
                material_id: number
                quantity: number
                quantity_unit: string
                notes?: string
            }[]
        }
    ) =>
        axiosClient.patch(`/product-recipes/${recipeId}`, payload),
}
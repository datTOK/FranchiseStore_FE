import axiosClient from "./axiosClient";

export type ProductRecipeIngredient = {
  id: number;
  recipe_id: number;
  material_id: number;
  quantity: number | string;
  quantity_unit?: string;
  quantity_base?: number | string;
  notes?: string;
};

export type ProductRecipeRow = {
  id: number;
  recipe_code?: string;
  product_id: number;
  name?: string;
  yield_quantity?: number | string;
  yield_unit?: string;
  status?: string;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
  product_name?: string;
  product_sku?: string;
  category_id?: number | null;
  category_name?: string;
  created_by_name?: string;
  ingredient_count?: number;
  ingredients?: ProductRecipeIngredient[];
};

export type ApiListResponse<T> = {
  data: T[];
};

const productRecipeApi = {
  getActive() {
    return axiosClient.get<ApiListResponse<ProductRecipeRow>>(
      "/product-recipes?status=ACTIVE"
    );
  },

  getAll() {
    return axiosClient.get<ApiListResponse<ProductRecipeRow>>("/product-recipes");
  },
};

export default productRecipeApi;
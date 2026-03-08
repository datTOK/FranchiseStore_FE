export interface RecipeIngredient {
  id: number
  recipe_id: number
  material_id: number
  quantity: string
  quantity_unit: string
  quantity_base: string
  notes: string
  created_at?: string
  material_name: string
  material_sku: string
  material_unit: string
}

export interface ProductRecipe {
  id: number
  recipe_code: string
  product_id: number
  name: string
  yield_quantity: string
  yield_unit: string
  status: "ACTIVE" | "INACTIVE"
  created_by: number
  created_at: string
  updated_at: string
  product_name: string
  product_sku: string
  category_id: number
  category_name: string
  created_by_name: string
  ingredient_count: number
  ingredients: RecipeIngredient[]
}

export interface ProductRecipeResponse {
  data: ProductRecipe[]
}

export interface ProductRecipeDetail {
  id: number
  recipe_code: string
  product_id: number
  name: string
  yield_quantity: string
  yield_unit: string
  status: "ACTIVE" | "INACTIVE"
  created_by: number
  created_at: string
  updated_at: string
  deleted_at: string | null
  product_name: string
  product_sku: string
  product_uom: string
  category_id: number
  category_name: string
  created_by_name: string
  ingredient_count: number
  ingredients: RecipeIngredient[]
}

export interface ProductRecipeDetailResponse {
  success: boolean
  data: ProductRecipeDetail
}

export interface RecipeIngredientInput {
  material_id: number
  quantity: number
  quantity_unit: string
  notes?: string
}

export interface CreateProductRecipePayload {
  category_id: number
  name: string
  yield_quantity: number
  yield_unit: string
  ingredients: RecipeIngredientInput[]
}

export interface CreateProductRecipeResponse {
  success: boolean
  data: {
    recipe: ProductRecipe
    product_id: number
  }
  message: string
}
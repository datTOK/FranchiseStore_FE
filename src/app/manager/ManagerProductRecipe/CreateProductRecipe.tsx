import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { productRecipeApi } from "../../../api/productRecipe.api"
import { categoryApi } from "../../../api/category.api"
import { materialApi } from "../../../api/material.api"
import type { CreateProductRecipePayload, RecipeIngredientInput } from "../../../types/productRecipe"
import type { Category } from "../../../types/category.type"
import type { Material } from "../../../types/material.type"

export default function CreateProductRecipe() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CreateProductRecipePayload>({
    category_id: 0,
    name: "",
    yield_quantity: 1,
    yield_unit: "PC",
    ingredients: [
      {
        material_id: 0,
        quantity: 0,
        quantity_unit: "G",
        notes: ""
      }
    ]
  })

  useEffect(() => {
    fetchMeta()
  }, [])

  const fetchMeta = async () => {
    try {
      const catRes = await categoryApi.getAll()
      setCategories(catRes.data.data)
      const matRes = await materialApi.getAll()
      setMaterials(matRes)
    } catch {
      toast.error("Failed to load categories or materials")
    }
  }

  const addIngredient = () => {
    setForm({
      ...form,
      ingredients: [
        ...form.ingredients,
        {
          material_id: 0,
          quantity: 0,
          quantity_unit: "G",
          notes: ""
        }
      ]
    })
  }

  const updateIngredient = (
    index: number,
    field: keyof RecipeIngredientInput,
    value: string | number
  ) => {
    const updated = [...form.ingredients]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setForm({
      ...form,
      ingredients: updated
    })
  }

  const handleCreate = async () => {
    try {
      setLoading(true)
      await productRecipeApi.create(form)
      toast.success("Recipe created successfully")
      navigate("/manager/product-recipes")
    } catch (err) {
      console.error(err)
      toast.error("Failed to create recipe")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-6">
          Create Product Recipe
        </h2>

        <div className="mb-4">
          <label className="text-sm text-gray-600">
            Recipe Name
          </label>

          <input
            className="w-full border rounded-lg p-2 mt-1"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value
              })
            }
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600">
            Category
          </label>

          <select
            className="w-full border rounded-lg p-2 mt-1"
            value={form.category_id}
            onChange={(e) =>
              setForm({
                ...form,
                category_id: Number(e.target.value)
              })
            }
          >
            <option value="">
              Select category
            </option>

            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}

          </select>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <label className="text-sm text-gray-600">
              Yield Quantity
            </label>

            <input
              type="number"
              className="w-full border rounded-lg p-2 mt-1"
              min={1}
              value={form.yield_quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  yield_quantity: Number(e.target.value)
                })
              }
            />
          </div>

          <div className="flex-1">
            <label className="text-sm text-gray-600">
              Yield Unit
            </label>

            <input
              className="w-full border rounded-lg p-2 mt-1"
              value={form.yield_unit}
              onChange={(e) =>
                setForm({
                  ...form,
                  yield_unit: e.target.value
                })
              }
            />
          </div>

        </div>

        <h3 className="font-semibold mb-3">
          Ingredients
        </h3>

        {form.ingredients.map((ing, index) => (

          <div key={index} className="flex gap-2 mb-2">

            <select
              className="border rounded p-2 w-1/3"
              value={ing.material_id}
              onChange={(e) =>
                updateIngredient(
                  index,
                  "material_id",
                  Number(e.target.value)
                )
              }
            >

              <option value="">
                Material
              </option>

              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}

            </select>

            <input
              type="number"
              className="border rounded p-2 w-24"
              placeholder="Qty"
              min={1}
              value={ing.quantity}
              onChange={(e) =>
                updateIngredient(
                  index,
                  "quantity",
                  Number(e.target.value)
                )
              }
            />

            <select
              className="border rounded p-2 w-20"
              value={ing.quantity_unit}
              onChange={(e) =>
                updateIngredient(
                  index,
                  "quantity_unit",
                  e.target.value
                )
              }
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="l">l</option>
              <option value="ml">ml</option>
              <option value="PC">PC</option>
            </select>

            <input
              className="border rounded p-2 flex-1"
              placeholder="Notes"
              value={ing.notes}
              onChange={(e) =>
                updateIngredient(
                  index,
                  "notes",
                  e.target.value
                )
              }
            />

          </div>

        ))}

        <button
          onClick={addIngredient}
          className="text-blue-600 text-sm mt-2"
        >
          + Add Ingredient
        </button>


        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            {loading ? "Creating..." : "Create Recipe"}
          </button>

        </div>

      </div>

    </div>
  )
}
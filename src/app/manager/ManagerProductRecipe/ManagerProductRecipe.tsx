import { useEffect, useState } from "react"
import { productRecipeApi } from "../../../api/productRecipe.api"
import type {
    ProductRecipe,
    ProductRecipeDetail,
    RecipeIngredient,
} from "../../../types/productRecipe"
import LoadingLottie from "../../../components/LoadingLottie"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import type { Material } from "../../../types/material.type"
import { materialApi } from "../../../api/material.api"
import { getAxiosErrorMessage } from "../../../utils/getAxiosErrorMessage"

export default function ManagerProductRecipe() {
    const navigate = useNavigate()
    const [recipes, setRecipes] = useState<ProductRecipe[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const totalPages = Math.ceil(recipes.length / pageSize)
    const paginatedRecipes = recipes.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    const [selectedRecipe, setSelectedRecipe] =
        useState<ProductRecipeDetail | null>(null)

    const [detailLoading, setDetailLoading] = useState(false)
    const [newIngredient, setNewIngredient] = useState({
        material_id: 0,
        quantity: 0,
        quantity_unit: "G",
        notes: "",
    })
    const [materials, setMaterials] = useState<Material[]>([])
    const [editingIngredientId, setEditingIngredientId] = useState<number | null>(null)

    const [editIngredient, setEditIngredient] = useState({
        quantity: 0,
        quantity_unit: "G",
        notes: "",
    })

    const fetchRecipes = async () => {
        try {
            setLoading(true)

            const res = await productRecipeApi.getAll()

            setRecipes(res.data.data)

            setCurrentPage(1)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load recipes")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecipes()
    }, [])

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const res = await materialApi.getAll()
                setMaterials(res)
            } catch {
                toast.error("Failed to load materials")
            }
        }

        fetchMaterials()
    }, [])

    const handleViewDetail = async (id: number) => {
        try {
            setDetailLoading(true)

            const res = await productRecipeApi.getDetail(id)

            setSelectedRecipe(res.data.data)
        } catch (err) {
            console.error(err)
            toast.error("Failed to load recipe detail")
        } finally {
            setDetailLoading(false)
        }
    }

    const handleAddIngredient = async () => {
        if (!selectedRecipe) return

        const updatedIngredients = [
            ...selectedRecipe.ingredients.map((i) => ({
                material_id: i.material_id,
                quantity: Number(i.quantity),
                quantity_unit: i.quantity_unit,
                notes: i.notes,
            })),
            newIngredient,
        ]

        try {
            await productRecipeApi.updateRecipe(selectedRecipe.id, {
                ingredients: updatedIngredients,
            })

            toast.success("Ingredient added")

            await handleViewDetail(selectedRecipe.id)

            setNewIngredient({
                material_id: 0,
                quantity: 0,
                quantity_unit: "G",
                notes: "",
            })
            await fetchRecipes()
        } catch (err: unknown) {
            toast.error(getAxiosErrorMessage(err, "Failed to add ingredient"))
        }
    }

    const handleEditClick = (ingredient: RecipeIngredient) => {
        setEditingIngredientId(ingredient.id)

        setEditIngredient({
            quantity: Number(ingredient.quantity),
            quantity_unit: ingredient.quantity_unit,
            notes: ingredient.notes || "",
        })
    }

    const handleUpdateIngredient = async () => {
        if (!selectedRecipe || !editingIngredientId) return

        const updatedIngredients = selectedRecipe.ingredients.map((i) =>
            i.id === editingIngredientId
                ? {
                    material_id: i.material_id,
                    quantity: editIngredient.quantity,
                    quantity_unit: editIngredient.quantity_unit,
                    notes: editIngredient.notes,
                }
                : {
                    material_id: i.material_id,
                    quantity: Number(i.quantity),
                    quantity_unit: i.quantity_unit,
                    notes: i.notes,
                }
        )

        try {
            await productRecipeApi.updateRecipe(selectedRecipe.id, {
                ingredients: updatedIngredients,
            })

            toast.success("Ingredient updated")

            setEditingIngredientId(null)

            await handleViewDetail(selectedRecipe.id)
        } catch (err: unknown) {
            toast.error(getAxiosErrorMessage(err, "Update failed"))
        }
    }

    const handleDeleteIngredient = async (ingredientId: number) => {
        if (!selectedRecipe) return

        const updatedIngredients = selectedRecipe.ingredients
            .filter((i) => i.id !== ingredientId)
            .map((i) => ({
                material_id: i.material_id,
                quantity: Number(i.quantity),
                quantity_unit: i.quantity_unit,
                notes: i.notes,
            }))

        try {
            await productRecipeApi.updateRecipe(selectedRecipe.id, {
                ingredients: updatedIngredients,
            })

            toast.success("Deleted")

            await handleViewDetail(selectedRecipe.id)
            await fetchRecipes()
        } catch (err: unknown) {
            toast.error(getAxiosErrorMessage(err, "Delete failed"))
        }
    }

    if (loading) return <LoadingLottie />

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                        Product Recipes
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Manage product recipes and ingredients
                    </p>
                </div>

                <button
                    onClick={() => navigate("/manager/product-recipes/create")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                >
                    + Create Recipe
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                {recipes.length === 0 ? (
                    <div className="p-12 text-center text-gray-400 text-sm">
                        No recipes found
                    </div>
                ) : (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4 text-left">Recipe</th>
                                <th className="px-6 py-4 text-left">Product</th>
                                <th className="px-6 py-4 text-left">Category</th>
                                <th className="px-6 py-4 text-center">Yield</th>
                                <th className="px-6 py-4 text-center">Ingredients</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginatedRecipes.map((recipe) => (
                                <tr
                                    key={recipe.id}
                                    className="border-t hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-800">
                                            {recipe.name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {recipe.recipe_code}
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {recipe.product_name}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {recipe.category_name}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        {parseFloat(recipe.yield_quantity)} {recipe.yield_unit}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        {recipe.ingredient_count}
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${recipe.status === "ACTIVE"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-200 text-gray-600"
                                                }`}
                                        >
                                            {recipe.status}
                                        </span>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleViewDetail(recipe.id)}
                                            className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-lg
             hover:bg-blue-600 hover:text-white
             transition-colors duration-200 cursor-pointer"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-2 text-sm">
                    <span>Rows:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setCurrentPage(1)
                            setPageSize(Number(e.target.value))
                        }}
                        className="border px-2 py-1 rounded"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg ${currentPage === page
                                ? "bg-black text-white"
                                : "border"
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                        Prev
                    </button>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {selectedRecipe && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
                        {detailLoading ? (
                            <LoadingLottie />
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold mb-4">
                                    {selectedRecipe.name}
                                </h3>

                                <div className="text-sm text-gray-500 mb-4">
                                    Recipe Code: {selectedRecipe.recipe_code}
                                </div>

                                <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <strong>Product:</strong>{" "}
                                        {selectedRecipe.product_name}
                                    </div>

                                    <div>
                                        <strong>Category:</strong>{" "}
                                        {selectedRecipe.category_name}
                                    </div>

                                    <div>
                                        <strong>Yield:</strong>{" "}
                                        {parseFloat(selectedRecipe.yield_quantity)}{" "}
                                        {selectedRecipe.yield_unit}
                                    </div>

                                    <div>
                                        <strong>Created By:</strong>{" "}
                                        {selectedRecipe.created_by_name}
                                    </div>
                                </div>

                                <h4 className="font-semibold mb-3">
                                    Ingredients
                                </h4>

                                <div className="space-y-2">
                                    {selectedRecipe.ingredients.map((ingredient) => {
                                        const isEditing = editingIngredientId === ingredient.id

                                        return (
                                            <div key={ingredient.id} className="border rounded-lg overflow-hidden bg-white">
                                                <div className="flex justify-between items-center px-4 py-3">
                                                    <div>
                                                        <div className="font-medium text-gray-800">
                                                            {ingredient.material_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {parseFloat(ingredient.quantity)} {ingredient.quantity_unit}
                                                            {ingredient.notes && ` • ${ingredient.notes}`}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                isEditing
                                                                    ? setEditingIngredientId(null)
                                                                    : handleEditClick(ingredient)
                                                            }
                                                            className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-500 hover:text-white transition cursor-pointer"
                                                        >
                                                            {isEditing ? "Close" : "Edit"}
                                                        </button>

                                                        <button
                                                            onClick={() => handleDeleteIngredient(ingredient.id)}
                                                            className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-600 hover:text-white transition cursor-pointer"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>

                                                {isEditing && (
                                                    <div className="border-t bg-gray-50 px-4 py-3 space-y-3 animate-fadeIn">
                                                        <div className="flex gap-3">
                                                            <input
                                                                type="number"
                                                                className="border rounded px-3 py-2 w-28 focus:ring-2 focus:ring-blue-400 outline-none"
                                                                value={editIngredient.quantity}
                                                                onChange={(e) =>
                                                                    setEditIngredient({
                                                                        ...editIngredient,
                                                                        quantity: Number(e.target.value),
                                                                    })
                                                                }
                                                            />

                                                            <select
                                                                className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                                                value={editIngredient.quantity_unit}
                                                                onChange={(e) =>
                                                                    setEditIngredient({
                                                                        ...editIngredient,
                                                                        quantity_unit: e.target.value,
                                                                    })
                                                                }
                                                            >
                                                                <option value="G">G</option>
                                                                <option value="KG">KG</option>
                                                                <option value="ML">ML</option>
                                                                <option value="L">L</option>
                                                                <option value="PC">PC</option>
                                                            </select>
                                                        </div>

                                                        <input
                                                            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
                                                            placeholder="Notes..."
                                                            value={editIngredient.notes}
                                                            onChange={(e) =>
                                                                setEditIngredient({
                                                                    ...editIngredient,
                                                                    notes: e.target.value,
                                                                })
                                                            }
                                                        />

                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => setEditingIngredientId(null)}
                                                                className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
                                                            >
                                                                Cancel
                                                            </button>

                                                            <button
                                                                onClick={handleUpdateIngredient}
                                                                className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
                                                            >
                                                                Save Changes
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>

                                <h4 className="font-semibold mt-6 mb-2">
                                    Add Ingredient
                                </h4>

                                <div className="flex gap-2 mb-3">

                                    <select
                                        className="border rounded p-2 w-1/3"
                                        value={newIngredient.material_id}
                                        onChange={(e) =>
                                            setNewIngredient({
                                                ...newIngredient,
                                                material_id: Number(e.target.value),
                                            })
                                        }
                                    >
                                        <option value="">Material</option>
                                        {materials.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="number"
                                        min={1}
                                        className="border rounded p-2 w-24"
                                        placeholder="Qty"
                                        value={newIngredient.quantity}
                                        onChange={(e) =>
                                            setNewIngredient({
                                                ...newIngredient,
                                                quantity: Number(e.target.value),
                                            })
                                        }
                                    />

                                    <select
                                        className="border rounded p-2 w-20"
                                        value={newIngredient.quantity_unit}
                                        onChange={(e) =>
                                            setNewIngredient({
                                                ...newIngredient,
                                                quantity_unit: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="g">g</option>
                                        <option value="kg">kg</option>
                                        <option value="ml">ml</option>
                                        <option value="l">l</option>
                                        <option value="PC">PC</option>
                                    </select>

                                    <input
                                        className="border rounded p-2 flex-1"
                                        placeholder="Notes"
                                        value={newIngredient.notes}
                                        onChange={(e) =>
                                            setNewIngredient({
                                                ...newIngredient,
                                                notes: e.target.value,
                                            })
                                        }
                                    />

                                </div>

                                <button
                                    onClick={handleAddIngredient}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                                >
                                    + Add Ingredient
                                </button>

                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={() => setSelectedRecipe(null)}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-200 transition cursor-pointer"
                                    >
                                        Close
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
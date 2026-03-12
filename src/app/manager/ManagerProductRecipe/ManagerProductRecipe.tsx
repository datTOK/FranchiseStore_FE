import { useEffect, useState } from "react"
import { productRecipeApi } from "../../../api/productRecipe.api"
import type {
    ProductRecipe,
    ProductRecipeDetail,
} from "../../../types/productRecipe"
import LoadingLottie from "../../../components/LoadingLottie"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

export default function ManagerProductRecipe() {
    const navigate = useNavigate()
    const [recipes, setRecipes] = useState<ProductRecipe[]>([])
    const [loading, setLoading] = useState(false)

    const [selectedRecipe, setSelectedRecipe] =
        useState<ProductRecipeDetail | null>(null)

    const [detailLoading, setDetailLoading] = useState(false)

    const fetchRecipes = async () => {
        try {
            setLoading(true)

            const res = await productRecipeApi.getAll()

            setRecipes(res.data.data)
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
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
                            {recipes.map((recipe) => (
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
                                        {recipe.yield_quantity} {recipe.yield_unit}
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
             transition-colors duration-200"
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
                                        {selectedRecipe.yield_quantity}{" "}
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
                                    {selectedRecipe.ingredients.map((ingredient) => (
                                        <div
                                            key={ingredient.id}
                                            className="flex justify-between border rounded-lg px-3 py-2 text-sm"
                                        >
                                            <div>
                                                {ingredient.material_name}
                                            </div>

                                            <div className="text-gray-600">
                                                {parseFloat(ingredient.quantity)}{" "}
                                                {ingredient.quantity_unit}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end mt-6">
                                    <button
                                        onClick={() => setSelectedRecipe(null)}
                                        className="px-4 py-2 border rounded-lg"
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
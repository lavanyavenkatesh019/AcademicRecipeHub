import React, { useState, useEffect } from "react";
import { Star, Pencil, Trash2, CheckCircle } from "lucide-react";
import { authFetch } from '../utils/authUtils';
import toast from 'react-hot-toast';
import { API_BASE_URL } from "../utils/apiConfig";

const RecipeManagement = ({ onEdit, onDeletePrompt }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/Recipes`)
      .then(res => res.json())
      .then(data => {
        setRecipes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching recipes:", err);
        setLoading(false);
      });
  }, []);

  const deleteRecipe = (id) => {
    onDeletePrompt({
      title: "Delete Recipe",
      message: "Are you sure you want to delete this recipe? This action will permanently remove it from the platform and cannot be undone.",
      onConfirm: async () => {
        try {
          const res = await authFetch(`${API_BASE_URL}/Recipes/${id}`, { 
            method: "DELETE" 
          });
          
          if (res.ok) {
            setRecipes(prev => prev.filter((recipe) => recipe.id !== id));
          } else {
            const data = await res.json().catch(() => ({}));
            toast.error(`Failed to delete recipe: ${data.message || "Server error"}`);
          }
        } catch (err) {
          console.error("Error deleting recipe:", err);
          toast.error("An error occurred while deleting the recipe.");
        }
      }
    });
  };

  const approveRecipe = (id) => {
    const recipeToUpdate = recipes.find(r => r.id === id);
    if (recipeToUpdate) {
      const updatedRecipe = { ...recipeToUpdate, status: "published" };
      authFetch(`${API_BASE_URL}/Recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecipe)
      })
      .then(() => {
        setRecipes(recipes.map(r => r.id === id ? updatedRecipe : r));
      })
      .catch(err => console.error("Error approving recipe:", err));
    }
  };

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.author && recipe.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">
          Recipe Management 
        </h3>

      </div>    
      <input
        type="text"
        placeholder="Search by title, category or author..."
        className="w-full mb-6 px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-orange-100 transition-all"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr className="text-gray-700">
              <th className="py-4 px-6 font-medium">Name</th>
              <th className="py-4 px-6 font-medium">Category</th>
              <th className="py-4 px-6 font-medium">Author</th>
              <th className="py-4 px-6 font-medium">Rating</th>
              <th className="py-4 px-6 font-medium">Status</th>
              <th className="py-4 px-6 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-5 px-6 text-center text-gray-500">
                  Loading recipes...
                </td>
              </tr>
            ) : filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe, index) => (
              <tr
                key={recipe.id}
                className={`border-t ${
                  index === recipes.length - 1 ? "" : "border-gray-200"
                }`}
              >
                <td className="py-5 px-6 font-medium text-gray-800">
                  {recipe.title}
                </td>

                <td className="py-5 px-6 text-gray-700">
                  {recipe.category}
                </td>

                <td className="py-5 px-6 text-gray-700">
                  {recipe.author || "Admin"}
                </td>

                <td className="py-5 px-6 flex items-center gap-2 text-gray-800">
                  <Star
                    size={16}
                    className="text-yellow-500 fill-yellow-500"
                  />
                  {recipe.rating}
                </td>

                <td className="py-5 px-6">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      recipe.status.toLowerCase() === "published"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {recipe.status}
                  </span>
                </td>

                <td className="py-5 px-6">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    {recipe.status.toLowerCase() === "pending" && (
                      <button
                        onClick={() => approveRecipe(recipe.id)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm group"
                        title="Approve Recipe"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}

                    <button 
                      onClick={() => onEdit(recipe)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                      title="Edit Recipe"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm group"
                      title="Delete Recipe"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
            ) : (
              <tr>
                <td colSpan="6" className="py-10 px-6 text-center text-gray-500">
                  <p className="text-lg font-medium">No recipes match your search.</p>
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="text-orange-500 font-bold mt-2 hover:underline"
                  >
                    Clear search
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecipeManagement;
import React, { useState, useEffect } from "react";
import { authFetch } from "../utils/authUtils";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../utils/apiConfig";
import { Pencil, Trash2, Check, X } from "lucide-react";

const Categories = ({ onDeletePrompt }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [stats, setStats] = useState(null);

  const fetchCategoriesAndStats = async () => {
    setLoading(true);
    try {
      const [catRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/Categories`),
        authFetch(`${API_BASE_URL}/Admin/stats`)
      ]);
      const data = await catRes.json();
      const statsData = await statsRes.json();
      
      setCategories(data);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndStats();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/Categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });

      if (res.ok) {
        setNewCategoryName("");
        fetchCategoriesAndStats();
      } else if (res.status === 409) {
        toast.error("A category with this name already exists.");
      } else {
        toast.error("Failed to add category.");
      }
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleUpdateCategory = async (id) => {
    if (!editingName.trim()) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/Categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() })
      });

      if (res.ok) {
        cancelEditing();
        fetchCategoriesAndStats();
      } else if (res.status === 409) {
        toast.error("A category with this name already exists.");
      } else {
        toast.error("Failed to update category.");
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = (id, name) => {
    onDeletePrompt({
      title: "Delete Category",
      message: `Are you sure you want to delete "${name}"? Existing recipes will be marked as 'Uncategorized'. This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await authFetch(`${API_BASE_URL}/Categories/${id}`, {
            method: "DELETE",
          });

          if (res.ok) {
            fetchCategoriesAndStats();
          } else {
            toast.error("Failed to delete category.");
          }
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      }
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 text-xl font-semibold">Loading categories database...</div>;
  }

  const categoryStats = stats?.categoryStats || [];
  const totalRecipes = stats?.totalRecipes || 0;
  const totalCategories = categoryStats.length;
  
  const mostPopular = categoryStats.length > 0 
    ? [...categoryStats].sort((a, b) => b.count - a.count)[0] 
    : { name: "None", count: 0 };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 text-white">
        <div className="bg-orange-600 rounded-3xl shadow-xl p-8 border border-orange-100/20">
          <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Total Categories</p>
          <h3 className="text-4xl font-black mt-2 tracking-tight">{categories.length}</h3>
          <p className="text-white/60 text-xs mt-1 font-medium">Active categories</p>
        </div>

        <div className="bg-orange-600 rounded-3xl shadow-xl p-8 border border-orange-100/20">
          <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Total Recipes</p>
          <h3 className="text-4xl font-black mt-2 tracking-tight">{totalRecipes}</h3>
          <p className="text-white/60 text-xs mt-1 font-medium">Across all categories</p>
        </div>

        <div className="bg-orange-600 rounded-3xl shadow-xl p-8 border border-orange-100/20">
          <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Most Common</p>
          <h3 className="text-4xl font-black mt-2 truncate tracking-tight">{mostPopular.name}</h3>
          <p className="text-white/60 text-xs mt-1 font-medium">{mostPopular.count} recipes</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gray-800">Categories Management</h2>
          <p className="text-gray-500 mt-2">Add, edit, and organize recipe categories across the platform.</p>
        </div>
        
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-orange-100 flex items-center gap-2">
           <input 
              type="text" 
              placeholder="New Category Name..." 
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="px-4 py-2 outline-none w-48 focus:ring-2 focus:ring-orange-50 rounded-xl"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
           />
           <button 
              onClick={handleAddCategory}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-8 rounded-xl transition-all shadow-lg shadow-orange-100"
           >
             Add
           </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-x-auto border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Category Name
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length > 0 ? categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === cat.id ? (
                    <input 
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="border-2 border-blue-400 rounded px-3 py-1 focus:outline-none w-full max-w-xs"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                    />
                  ) : (
                    <span className="text-sm font-bold text-gray-900">{cat.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingId === cat.id ? (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleUpdateCategory(cat.id)} 
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        title="Save Changes"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={cancelEditing} 
                        className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-400 hover:text-white transition-all shadow-sm"
                        title="Cancel Editing"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => startEditing(cat)} 
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Edit Category"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id, cat.name)} 
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        title="Delete Category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="2" className="px-6 py-8 text-center text-gray-400">
                  No categories found. Start by adding one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Categories;
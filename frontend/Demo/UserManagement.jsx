import React, { useState, useEffect } from "react";
import { FaStar, FaTrash } from "react-icons/fa";
import { authFetch } from '../utils/authUtils';
import toast from 'react-hot-toast';
import { API_BASE_URL } from "../utils/apiConfig";

const UserManagement = ({ onDeletePrompt }) => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch users
    authFetch(`${API_BASE_URL}/Users`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch stats
    authFetch(`${API_BASE_URL}/Admin/stats`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  }, []);

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "Admin").length;
  const totalRecipes = stats?.totalRecipes || 0;
  const totalCategories = stats?.totalCategories || 0;
  const mostPopular = stats?.mostPopularRecipe || "None";
  const [showModal, setShowModal] = useState(null); // 'categories' or 'topRated'

  const statItems = [
    {
      id: "users",
      title: "Total Users",
      value: totalUsers,
      subtitle: "Overall registered users",
      color: "bg-orange-600",
      clickable: false
    },
    {
      id: "categories",
      title: "Total Categories",
      value: totalCategories,
      subtitle: "Click to see all categories",
      color: "bg-orange-600",
      clickable: true
    },
    {
      id: "recipes",
      title: "Total Recipes",
      value: totalRecipes,
      subtitle: "Recipes on platform",
      color: "bg-orange-600",
      clickable: false
    },
    {
      id: "popular",
      title: "Most Rated (Popular)",
      value: mostPopular,
      subtitle: `Rating: ${stats?.mostPopularRating || 0} (Click for Top Rated)`,
      color: "bg-orange-600",
      clickable: true
    }
  ];
   const topRatedRecipes = stats?.topRatedRecipes || [];

  const handleRemove = (id) => {
    onDeletePrompt({
      title: "Remove User",
      message: "Are you sure you want to remove this user? All their recipes and activity will also be permanently deleted from the platform.",
      onConfirm: async () => {
        try {
          const res = await authFetch(`${API_BASE_URL}/Users/${id}`, {
            method: "DELETE"
          });
          if (res.ok) {
            setUsers(prev => prev.filter((user) => user.id !== id));
          } else {
            toast.error("Failed to remove user. Please try again.");
          }
        } catch (err) {
          console.error("Error removing user:", err);
          toast.error("An error occurred while removing the user.");
        }
      }
    });
  };

  return (
    <div>

    <div className="bg-white p-8 rounded-xl shadow-md">

    
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">
          User Management
        </h3>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">

        <table className="w-full text-left">

          <thead className="bg-orange-100/50">
            <tr className="text-gray-700">
              <th className="py-4 px-6 font-medium">Name</th>
              <th className="py-4 px-6 font-medium">Email</th>
              <th className="py-4 px-6 font-medium">Role</th>
              <th className="py-4 px-6 font-medium">Joined</th>
              <th className="py-4 px-6 font-medium text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-5 px-6 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.id}
                  className={`border-t ${
                    index === users.length - 1 ? "" : "border-gray-200"
                  }`}
                >
                  <td className="py-5 px-6 font-medium text-gray-800">
                    {user.username}
                  </td>
  
                  <td className="py-5 px-6 text-gray-700">
                    {user.username}@example.com
                  </td>
  
                  <td className="py-5 px-6">
                    <span
                      className={`px-3 py-2 text-xs rounded-full ${
                        user.role === "Admin"
                          ? "bg-orange-100 text-orange-600"
                          : "bg-orange-50 text-orange-400"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
  
                  <td className="py-5 px-6 text-gray-700">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
  
                  <td className="py-5 px-6">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm group"
                        title="Remove User"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
  
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

    </div>
    <div className="pt-10 bg-orange-50/10">
  <h2 className="text-2xl font-bold text-gray-800 mb-6">
    Analytics & Statistics
  </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {statItems.map((item, index) => (
          <div
            key={index}
            onClick={() => item.clickable && setShowModal(item.id)}
            className={`${item.color} text-white p-6 rounded-2xl shadow-xl hover:-translate-y-2 transition-all duration-300 ${item.clickable ? "cursor-pointer" : ""}`}
          >
        <h4 className="text-sm opacity-90">{item.title}</h4>
        <h1 className="text-3xl font-bold my-2 truncate">{item.value}</h1>
        <p className="text-sm opacity-90">{item.subtitle}</p>
      </div>
    ))}
  </div>

  {/* Category List Modal */}
  {showModal === 'categories' && (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">Available Categories</h3>
          <button onClick={() => setShowModal(null)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats?.categoryStats.map((cat, idx) => (
            <div key={idx} className="bg-orange-50 p-4 rounded-xl flex justify-between items-center">
              <span className="font-semibold text-gray-700">{cat.name}</span>
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold">{cat.count} recipes</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}

  {/* Top Rated Recipes Modal */}
  {showModal === 'popular' && (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">Top Rated Recipes (≥ 4.0)</h3>
          <button onClick={() => setShowModal(null)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-orange-50">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Rating</th>
              </tr>
            </thead>
            <tbody>
              {stats?.topRatedRecipes.map((recipe) => (
                <tr key={recipe.id} className="border-t hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-medium">{recipe.title}</td>
                  <td className="py-3 px-4 text-gray-600">{recipe.category}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                       <FaStar size={14} /> {recipe.rating}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}
</div>
    <div className="pt-24 pb-16 bg-orange-50/10">
      <div className="px-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
              Top Rated Excellence
            </h2>
            <p className="text-orange-600 font-bold text-sm mt-1 uppercase tracking-widest leading-none">
              Community Favorites (4.0+)
            </p>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-1 bg-orange-500 rounded-full"></div>
            <div className="w-4 h-1 bg-orange-200 rounded-full"></div>
          </div>
        </div>

        {/* Sliding Carousel */}
        <div className="flex overflow-x-auto gap-8 pb-10 scrollbar-hide snap-x snap-mandatory">
          {topRatedRecipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="flex-none w-[280px] md:w-[320px] bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-orange-100 border border-orange-50 snap-start hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-125 transition-transform duration-700 opacity-50"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Ranking & Rating */}
                <div className="flex justify-between items-start mb-8">
                   <div className="bg-orange-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-orange-200 rotate-3 group-hover:rotate-0 transition-transform">
                     {index + 1}
                   </div>
                   <div className="bg-white px-4 py-2 rounded-2xl border border-orange-100 flex items-center gap-2 shadow-sm">
                      <FaStar className="text-yellow-500" />
                      <span className="font-black text-gray-900">{recipe.rating}</span>
                   </div>
                </div>

                {/* Recipe Info */}
                <div className="flex-grow">
                   <h3 className="text-2xl font-black text-gray-900 leading-tight mb-4 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                     {recipe.title}
                   </h3>
                   <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-widest">
                     {recipe.category}
                   </div>
                </div>
              </div>
            </div>
          ))}

          {topRatedRecipes.length === 0 && (
            <div className="w-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-orange-100">
               <p className="text-gray-400 font-bold uppercase tracking-widest">No top rated recipes yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default UserManagement;
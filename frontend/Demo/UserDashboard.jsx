import React, { useState, useEffect } from "react";
import { FaEdit, FaLock, FaTimes, FaBars, FaHome, FaSignOutAlt } from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { authFetch, logoutUser } from '../utils/authUtils';
import { toast } from 'react-hot-toast';
import CreateRecipe from "./CreateRecipe";
import { motion, AnimatePresence } from "framer-motion";
import LogoIcon from "./LogoIcon";
import { API_BASE_URL } from '../utils/apiConfig';

export default function UserDashboard() {
  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "User";

  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profilePic, setProfilePic] = useState(localStorage.getItem("profilePicture") || null);
  const [search, setSearch] = useState("");

  const [myRecipes, setMyRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [totalActivity, setTotalActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingRecipe, setEditingRecipe] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCreated, resSaved, resTotal] = await Promise.all([
        authFetch(`${API_BASE_URL}/UserActivity/created/${userId}`),
        authFetch(`${API_BASE_URL}/UserActivity/saved/${userId}`),
        authFetch(`${API_BASE_URL}/UserActivity/total/${userId}`)
      ]);

      const created = await resCreated.json();
      const saved = await resSaved.json();
      const total = await resTotal.json();

      setMyRecipes(created.map(r => ({ ...r, name: r.title, time: r.cookingTime, image: r.imageUrl || "/Picture/paneer.jpg" })));
      setSavedRecipes(saved.map(r => ({ ...r, name: r.title, time: r.cookingTime, image: r.imageUrl || "/Picture/paneer.jpg" })));

      const combined = [...total.createdRecipes, ...total.savedRecipes];
      setTotalActivity(combined.map(r => ({ ...r, name: r.title, time: r.cookingTime, image: r.imageUrl || "/Picture/paneer.jpg" })));

      const resUser = await authFetch(`${API_BASE_URL}/Users/${userId}`);
      if (resUser.ok) {
        const userData = await resUser.json();
        if (userData.profilePicture) {
          setProfilePic(userData.profilePicture);
          localStorage.setItem("profilePicture", userData.profilePicture);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [userId, activePage]);


  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/Recipes/random?count=4`)
      .then(res => res.json())
      .then(data => setRecommended(data.map(r => ({ 
        ...r, 
        name: r.title, 
        time: r.cookingTime, 
        level: r.level,
        image: r.imageUrl || "/Picture/paneer.jpg" 
      }))))
      .catch(err => console.error(err));
  }, []);

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setProfilePic(base64String);

        try {
          const response = await authFetch(`${API_BASE_URL}/Users/${userId}/profile-picture`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ profilePicture: base64String }),
          });

          if (response.ok) {
            localStorage.setItem("profilePicture", base64String);
            window.dispatchEvent(new Event("storage")); 
            toast.success("Profile picture updated!");
            setShowProfileMenu(false);
          } else {
            console.error("Failed to update profile picture");
          }
        } catch (error) {
          console.error("Error updating profile picture:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePic = async () => {
    if (!userId) {
      toast.error("Session expired. Please login again.");
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/Users/${userId}/profile-picture`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profilePicture: "" }),
      });

      if (response.ok) {
        setProfilePic(null);
        localStorage.removeItem("profilePicture");
        window.dispatchEvent(new Event("storage"));
        toast.success("Profile picture removed!");
        setShowProfileMenu(false);
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to remove profile picture");
      }
    } catch (error) {
      console.error("Error removing profile picture:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/Login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const filteredRecipes = myRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(search.toLowerCase())
  );

  if (editingRecipe) {
    return (
      <CreateRecipe
        recipeToEdit={editingRecipe}
        onBack={() => {
          setEditingRecipe(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <div className="h-screen bg-orange-50 flex flex-col md:flex-row relative overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Responsive Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white shadow-2xl md:shadow-lg flex flex-col justify-between z-50 transition-transform duration-300 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="pt-8 px-8 pb-0 flex justify-between items-center">
            <div className="cursor-pointer flex flex-col items-center gap-1 bg-transparent transition-all active:scale-95" onClick={() => navigate("/Home")}>
              <LogoIcon className="h-14 w-14 transition-transform hover:scale-105" />
              <span className="text-xl font-black text-orange-600 tracking-tighter">
                RecipeHub
              </span>
            </div>
            <button className="md:hidden p-2 hover:bg-orange-50 rounded-full text-orange-600" onClick={() => setSidebarOpen(false)}>
              <FaTimes size={20} />
            </button>
          </div>

          <nav className="mt-4 px-4 space-y-2">
            <div 
              onClick={() => navigate("/Home")}
              className="px-6 py-4 cursor-pointer hover:bg-orange-50 rounded-2xl transition-all flex items-center gap-4 text-gray-500 font-semibold group"
            >
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all text-orange-600">
                <FaHome size={16} />
              </div>
              <span>Home</span>
            </div>
            <SidebarItem title="Dashboard" active={activePage} setActive={(t) => { setActivePage(t); setSidebarOpen(false); }} icon={<FaHome />} />
            <SidebarItem title="My Recipes" active={activePage} setActive={(t) => { setActivePage(t); setSidebarOpen(false); }} />
            <SidebarItem title="Saved Recipes" active={activePage} setActive={(t) => { setActivePage(t); setSidebarOpen(false); }} />
            <SidebarItem title="Total Activity" active={activePage} setActive={(t) => { setActivePage(t); setSidebarOpen(false); }} />

            <div className="h-px bg-orange-100 my-4 mx-4" />

            <div
              onClick={() => { setShowPasswordModal(true); setSidebarOpen(false); }}
              className="px-6 py-4 cursor-pointer hover:bg-orange-50 rounded-2xl transition-all flex items-center gap-4 text-gray-600 font-semibold group"
            >
              <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                <FaLock className="text-gray-400 group-hover:text-orange-500 text-sm" />
              </div>
              <span>Security</span>
            </div>
          </nav>
        </div>

        <div className="p-6 border-t border-orange-50 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 hover:bg-red-500 text-red-600 hover:text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs transition-all active:scale-95"
          >
            <FaSignOutAlt />
            Logout Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden relative">
        {/* Responsive Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 px-6 md:px-12 flex justify-between items-center sticky top-0 z-30 border-b border-orange-100/50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
            >
              <FaBars size={20} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
              Welcome, <span className="text-orange-600">{username}</span>
            </h1>
          </div>

          {/* Profile Picture with Menu */}
          <div className="relative profile-menu-container">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-orange-100 flex items-center justify-center overflow-hidden bg-white shadow-sm transition-all duration-300">
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-200">
                   <FaEdit size={24} />
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="absolute -bottom-1 -right-1 bg-orange-600 p-2 rounded-xl cursor-pointer hover:bg-orange-700 shadow-lg transition-all active:scale-90 border-2 border-white z-10"
            >
              <FaEdit className="text-white text-xs" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-orange-100 py-2 z-50 overflow-hidden"
                >
                  <label className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors group text-gray-700 font-semibold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      <FaEdit size={14} />
                    </div>
                    <span>Update Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileChange}
                    />
                  </label>

                  <button 
                    onClick={removeProfilePic}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors group text-red-600 font-semibold text-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                      <FaTimes size={14} />
                    </div>
                    <span>Remove Photo</span>
                  </button>

                  <div className="h-px bg-orange-50 my-1 mx-4" />

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 cursor-pointer transition-colors group text-gray-700 font-semibold text-sm"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-gray-600 group-hover:text-white transition-colors">
                      <FaSignOutAlt size={14} />
                    </div>
                    <span>Logout Account</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {showPasswordModal && (
          <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
        )}

        <main className="p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activePage === "Dashboard" && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Your Activity</h2>
                  <p className="text-gray-500 font-medium">Keep track of your culinary journey.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
                <div onClick={() => setActivePage("My Recipes")} className="cursor-pointer group">
                  <StatCard title="My Recipes" value={myRecipes.length} color="text-orange-600" />
                </div>
                <div onClick={() => setActivePage("Saved Recipes")} className="cursor-pointer group">
                  <StatCard title="Saved Recipes" value={savedRecipes.length} color="text-orange-600" />
                </div>
                <div onClick={() => setActivePage("Total Activity")} className="cursor-pointer group">
                  <StatCard title="Total Activity" value={totalActivity.length} color="text-orange-600" />
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Recommended For You
                </h2>
                <div className="h-px flex-1 bg-orange-100 mx-6 hidden sm:block" />
              </div>
              <RecipeGrid data={recommended} navigate={navigate} />
            </>
          )}

          {activePage === "My Recipes" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">My Published Recipes</h2>
                <div className="relative w-full md:w-96">
                  <input
                    type="text"
                    placeholder="Search your recipes..."
                    className="w-full pl-6 pr-4 py-4 rounded-2xl bg-white shadow-sm border border-orange-50 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <RecipeGrid data={filteredRecipes} navigate={navigate} allowEdit={true} onEdit={(recipe) => setEditingRecipe(recipe)} />
            </div>
          )}

          {activePage === "Saved Recipes" && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8">Your Saved Recipes</h2>
              {savedRecipes.length > 0 ? (
                <RecipeGrid data={savedRecipes} navigate={navigate} />
              ) : (
                <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-orange-100">
                  <p className="text-xl text-gray-400 font-semibold">You haven't saved any recipes yet!</p>
                  <button onClick={() => navigate("/Home/Recipes")} className="mt-4 text-orange-600 font-semibold hover:underline">Explore recipes</button>
                </div>
              )}
            </div>
          )}

          {activePage === "Total Activity" && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Total Activity</h2>
              <p className="text-gray-500 mb-10 font-medium">All the recipes you've created and saved in one place.</p>
              {totalActivity.length > 0 ? (
                <RecipeGrid data={totalActivity} navigate={navigate} />
              ) : (
                <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-orange-100">
                  <p className="text-xl text-gray-400 font-semibold">No activity yet!</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/Users/${userId}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        toast.success("Password updated successfully!");
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-orange-950/20 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-[0_32px_64px_-16px_rgba(251,146,60,0.2)] overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-orange-600 p-8 flex justify-between items-center text-white">
          <h2 className="text-2xl font-bold tracking-tight">Security</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-widest ml-1">Current Password</label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-widest ml-1">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-widest ml-1">Confirm New Password</label>
              <input
                type="password"
                required
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all font-medium"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 rounded-2xl bg-orange-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-orange-700 shadow-xl shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function SidebarItem({ title, active, setActive, icon }) {
  return (
    <div
      onClick={() => setActive(title)}
      className={`px-6 py-4 cursor-pointer transition-all rounded-2xl flex items-center gap-4 ${active === title
          ? "bg-orange-600 text-white shadow-xl shadow-orange-500/20 font-bold scale-[1.02]"
          : "text-gray-500 hover:bg-orange-50 hover:text-orange-700 font-semibold"
        }`}
    >
      <div className={`transition-colors ${active === title ? "text-white" : "text-gray-300"}`}>
        {icon}
      </div>
      <span>{title}</span>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-orange-50/50 hover:shadow-xl hover:border-orange-200 transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-orange-50/50 scale-0 group-hover:scale-100 transition-transform duration-700`} />
      <h2 className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">{title}</h2>
      <p className={`text-5xl font-bold ${color} relative flex items-baseline gap-1`}>
        {value}
        <span className="text-xs text-gray-300">items</span>
      </p>
    </div>
  );
}

function RecipeGrid({ data, navigate, allowEdit, onEdit }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {data.map((recipe, idx) => (
        <div key={idx} className="bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-orange-50/50 hover:border-orange-200 overflow-hidden group flex flex-col">
          <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => navigate(`/ViewRecipe/${recipe.id}`)}>
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[1.5s]"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"; }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
              <span className="text-white font-bold text-sm tracking-tight">View Full Recipe</span>
            </div>
          </div>
          <div className="p-7 flex flex-col flex-grow">
            <h3
              onClick={() => navigate(`/ViewRecipe/${recipe.id}`)}
              className="font-bold text-xl text-gray-900 group-hover:text-orange-600 transition-colors mb-2 line-clamp-1 cursor-pointer tracking-tight"
            >
              {recipe.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-400 font-semibold uppercase tracking-wider mb-6">
              <div className="flex items-center gap-1.5">
                <MdOutlineTimer className="text-orange-500" size={16} />
                <span>{recipe.time}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span>{recipe.level || "Medium"}</span>
            </div>
            {allowEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(recipe); }}
                className="mt-auto w-full py-4 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all"
                title="Edit this recipe"
              >
                Edit Recipe
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
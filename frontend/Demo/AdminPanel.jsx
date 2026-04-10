import React, { useState } from "react";
import {
  Users,
  Utensils,
  Layers,
  BarChart3,
  Home,
  LogOut,
  Menu,
  X,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogoIcon from "./LogoIcon";

import UserManagement from "./UserManagement";
import RecipeManagement from "./RecipeManagement";
import Categories from "./Categories";
import Reports from "./Reports";
import CreateRecipe from "./CreateRecipe";
import Navbar from "./Navbar";
import { logoutUser } from "../utils/authUtils";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [editingRecipe, setEditingRecipe] = useState(null);
  
  // Custom Delete Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    isLoading: false
  });

  const promptDelete = (config) => {
    setDeleteModal({
      ...config,
      isOpen: true,
      isLoading: false
    });
  };

  const handleConfirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, isLoading: true }));
    await deleteModal.onConfirm();
    setDeleteModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setActiveTab("edit_recipe");
  };

  const handleBackToManagement = () => {
    setEditingRecipe(null);
    setActiveTab("recipes");
  };

  const handleCreateRecipe = () => {
    setEditingRecipe(null);
    setActiveTab("edit_recipe");
  };

  return (
    <div className="h-screen bg-orange-50 flex flex-col relative overflow-hidden">
      {/* App Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} onCreateClick={handleCreateRecipe} />

      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Control Panel Sidebar */}
        <aside
          className={`fixed md:sticky top-0 left-0 h-full w-72 bg-white shadow-2xl md:shadow-lg flex flex-col justify-between z-50 transition-transform duration-300 transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        >
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="pt-8 px-8 pb-0 flex justify-between items-center">
            <div className="cursor-pointer flex flex-col items-center gap-1 bg-transparent border-none shadow-none transition-all active:scale-95" onClick={() => navigate("/Home")}>
              <LogoIcon className="h-14 w-14 transition-transform hover:scale-105" />
              <span className="text-xl font-black text-orange-600 tracking-tighter">
                RecipeHub
              </span>
            </div>
            <button className="md:hidden p-2 hover:bg-orange-50 rounded-full text-orange-600" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-4">
             <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Control Panel</h2>
             <div className="space-y-2">
                <button
                  onClick={() => navigate("/Home")}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 text-gray-500 hover:bg-orange-50 hover:text-orange-600 font-semibold group"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all text-orange-600">
                    <Home size={16} /> 
                  </div>
                  <span>Go to Home</span>
                </button>

                <button
                  onClick={() => { setActiveTab("users"); setEditingRecipe(null); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                    activeTab === "users" ? "bg-orange-500 text-white shadow-xl shadow-orange-200 font-bold scale-[1.02]" : "text-gray-500 hover:bg-orange-50 hover:text-orange-600 font-semibold"
                  }`}
                >
                  <Users size={20} />
                  <span>User Management</span>
                </button>

                <button
                  onClick={() => { setActiveTab("recipes"); setEditingRecipe(null); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                    activeTab === "recipes" ? "bg-orange-500 text-white shadow-xl shadow-orange-200 font-bold scale-[1.02]" : "text-gray-500 hover:bg-orange-50 hover:text-orange-600 font-semibold"
                  }`}
                >
                  <Utensils size={20} />
                  <span>Recipe Management</span>
                </button>

                <button
                  onClick={() => { setActiveTab("category"); setEditingRecipe(null); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                    activeTab === "category" ? "bg-orange-500 text-white shadow-xl shadow-orange-200 font-bold scale-[1.02]" : "text-gray-500 hover:bg-orange-50 hover:text-orange-600 font-semibold"
                  }`}
                >
                  <Layers size={20} />
                  <span>Categories</span>
                </button>

                <button
                  onClick={() => { setActiveTab("reports"); setEditingRecipe(null); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                    activeTab === "reports" ? "bg-orange-500 text-white shadow-xl shadow-orange-200 font-bold scale-[1.02]" : "text-gray-500 hover:bg-orange-50 hover:text-orange-600 font-semibold"
                  }`}
                >
                  <BarChart3 size={20} />
                  <span>Reports</span>
                </button>
              </div>
          </div>
        </div>

        <div className="p-6 border-t border-orange-50 mt-auto">
          <button 
            onClick={() => {
                logoutUser();
                navigate("/Login");
            }}
            className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95 uppercase tracking-widest text-xs"
          >
            <LogOut size={16} />
            Logout Account
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative bg-orange-50/20">
        <main className="p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
          {/* Desktop Summary Info (Hidden on Mobile as it's in the header) */}
          <div className="hidden md:flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-orange-900 tracking-tight uppercase">
                {activeTab.replace("_", " ")} Overview
              </h2>
              <p className="text-orange-700/60 font-medium mt-1">Platform metrics and moderation control.</p>
            </div>
          </div>

          {/* Content Wrapper */}
          <div className="w-full relative">
            {activeTab === "users" && <UserManagement onDeletePrompt={promptDelete} />}
            {activeTab === "recipes" && <RecipeManagement onEdit={handleEditRecipe} onDeletePrompt={promptDelete} />}
            {activeTab === "category" && <Categories onDeletePrompt={promptDelete} />}
            {activeTab === "reports" && <Reports onDeletePrompt={promptDelete} />}
          </div>
        </main>
      </div>

      {/* Edit Mode Overlay (Moved to top level for correct stacking) */}
      {activeTab === "edit_recipe" && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto animate-in fade-in duration-300">
          <CreateRecipe onBack={handleBackToManagement} recipeToEdit={editingRecipe} />
        </div>
      )}

        {/* Global Confirmation Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-orange-900/10 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-orange-100 flex flex-col p-8 items-center text-center">
              <div className="bg-orange-50 p-6 rounded-full mb-6">
                <Trash2 size={40} className="text-orange-600 animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase tracking-tight">
                {deleteModal.title || "Confirm Action"}
              </h3>
              
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                {deleteModal.message || "Are you sure you want to perform this action? This cannot be undone."}
              </p>

              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                  disabled={deleteModal.isLoading}
                  className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-400 font-bold hover:bg-gray-100 transition-all uppercase tracking-tighter"
                >
                  No, Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  disabled={deleteModal.isLoading}
                  className="flex-1 py-4 rounded-2xl bg-orange-600 text-white font-bold hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all uppercase tracking-tighter flex items-center justify-center"
                >
                  {deleteModal.isLoading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Yes, Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
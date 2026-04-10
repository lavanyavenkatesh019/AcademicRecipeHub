import { useState, useEffect } from "react";
import { BsCameraFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { authFetch } from '../utils/authUtils';
import toast from 'react-hot-toast';
import { API_BASE_URL } from "../utils/apiConfig";

const CreateRecipe = ({ onBack, recipeToEdit }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "Veg",
    ingredients: "",
    instructions: "",
    cookingTime: "",
    level: "Medium",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoriesList, setCategoriesList] = useState(["Veg", "Non-Veg", "Dessert", "Beverages", "North Indian", "South Indian", "Breakfast"]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/Categories`)
      .then(res => res.json())
      .then(data => setCategoriesList(data.map(c => c.name)))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    if (recipeToEdit) {
      setFormData({
        title: recipeToEdit.title || "",
        category: recipeToEdit.category || "Veg",
        ingredients: recipeToEdit.ingredients || "",
        instructions: recipeToEdit.instructions || "",
        cookingTime: recipeToEdit.cookingTime || "",
        level: recipeToEdit.level || "Medium",
        image: null,
      });
      if (recipeToEdit.imageUrl) {
        setImagePreview(recipeToEdit.imageUrl);
      }
    }
  }, [recipeToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem("userId") || 1;
      
      let finalImageUrl = recipeToEdit?.imageUrl || "/Picture/paneer.jpg";
      
      if (formData.image) {
        // Convert image to Base64
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(formData.image);
        });
        finalImageUrl = await base64Promise;
      }

      const recipeData = {
        title: formData.title,
        description: formData.ingredients.substring(0, 100) + "...", // Short desc
        imageUrl: finalImageUrl,
        category: formData.category,
        cookingTime: formData.cookingTime,
        level: formData.level,
        ingredients: formData.ingredients,
        instructions: formData.instructions,
        createdBy: parseInt(userId),
        status: recipeToEdit?.status || "published"
      };

      const url = recipeToEdit 
        ? `${API_BASE_URL}/Recipes/${recipeToEdit.id}`
        : `${API_BASE_URL}/Recipes`;
      
      const method = recipeToEdit ? "PUT" : "POST";

      const response = await authFetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipeData),
      });

      if (response.ok) {
        toast.success(`Recipe "${formData.title}" ${recipeToEdit ? "updated" : "created"} successfully!`);
        if (!recipeToEdit) {
          setFormData({ title: "", category: "Veg", ingredients: "", instructions: "", cookingTime: "", level: "Medium", image: null });
        }
        onBack();
      } else {
        toast.error(`Failed to ${recipeToEdit ? "update" : "create"} recipe. Please try again.`);
      }
    } catch (error) {
      console.error(`Error ${recipeToEdit ? "updating" : "creating"} recipe:`, error);
      toast.error("An error occurred. Is the API running?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

      <div className="min-h-screen bg-white">
      <div className="bg-orange-100 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-orange-700 hover:text-orange-800 font-semibold mb-4 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
            {recipeToEdit ? "Edit Recipe" : "Create Recipe"}
          </h1>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-6 py-12">
        <form onSubmit={handleSubmit} className="bg-white/70 p-8 rounded-3xl shadow-2xl">
          <div className="space-y-6">
      
            <div>
              <label className="block text-lg font-semibold text-orange-900 mb-3">Recipe Name</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter your recipe name"
                className="w-full p-4 border-2 border-orange-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-all bg-orange-50 text-orange-900 placeholder-orange-500"
                required
              />
            </div>
      
            <div>
              <label className="block text-lg font-semibold text-orange-900 mb-3">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-4 border-2 border-orange-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-all bg-orange-50 text-orange-900"
              >
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-semibold text-orange-900 mb-3">Recipe Photo</label>
              <div className="w-full bg-gradient-to-br from-orange-50 to-orange-100 p-12 rounded-2xl border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="w-full h-full flex flex-col items-center justify-center text-center pointer-events-none z-10">
                  <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300"><BsCameraFill /></div>
                  <p className="text-xl font-semibold text-orange-800 mb-2">Click to upload image</p>
                  <p className="text-orange-600 text-sm">PNG, JPG up to 5MB</p>
                </label>
                {imagePreview && (
                  <div className="absolute inset-0 bg-white flex items-center justify-center p-0 pointer-events-none">
                    <img 
                      src={imagePreview} 
                      alt="Recipe Preview" 
                      className="w-full h-full object-cover animate-in fade-in transition duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-end p-4">
                      <p className="text-white text-xs font-bold uppercase tracking-widest bg-orange-600/80 px-4 py-2 rounded-full shadow-lg">Change Photo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-lg font-semibold text-orange-900 mb-3">Recipe Ingredients</label>
              <textarea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                placeholder="200g Paneer, 2 Tomatoes, Spices..."
                className="w-full p-4 border-2 border-orange-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-all bg-orange-50 text-orange-900 placeholder-orange-500 resize-vertical h-36"
                required
              />
            </div>
             <div>
              <label className="block text-lg font-semibold text-orange-900 mb-3">Recipe Preparation Steps:</label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="1. Chop veggies. 2. Sauté..."
                className="w-full p-4 border-2 border-orange-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-all bg-orange-50 text-orange-900 placeholder-orange-500 resize-vertical h-36"
                required
              />
            </div>
             <div>
              <label className="block text-lg font-semibold text-orange-900 mb-3">Recipe Time</label>
              <input
                type="text"
                name="cookingTime"
                value={formData.cookingTime}
                onChange={handleChange}
                placeholder="e.g. 30 mins"
                className="w-full p-4 border-2 border-orange-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-all bg-orange-50 text-orange-900 placeholder-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-orange-900 mb-3">Difficulty Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full p-4 border-2 border-orange-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-all bg-orange-50 text-orange-900 font-bold"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
        
            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-1 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? (recipeToEdit ? "Updating..." : "Creating...") : (recipeToEdit ? "Update Recipe" : "Create Recipe")}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-8 py-4 bg-orange-200 hover:bg-orange-300 text-orange-800 font-bold rounded-2xl transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

  );
};

export default CreateRecipe;

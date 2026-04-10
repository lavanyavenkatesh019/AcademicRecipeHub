import React from "react";
import Navbar from "./Navbar";
import ViewRecipe from "./ViewRecipe";
import CreateRecipe from "./CreateRecipe";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineTimer, MdArrowBack, MdHome } from "react-icons/md";
import { authFetch } from '../utils/authUtils';
import toast from 'react-hot-toast';
import { API_BASE_URL } from "../utils/apiConfig";

export default function HomeUI() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showCreate, setShowCreate] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(location.state?.category || "All");
  const [activeLevel, setActiveLevel] = useState("All");
  const [categoryList, setCategoryList] = useState(["All", "Breakfast", "Veg", "Non-Veg", "Beverages", "North Indian", "South Indian"]);
  const difficultyLevels = ["All", "Easy", "Medium", "Hard"];
  const [savedRecipeIds, setSavedRecipeIds] = useState([]);

  const [currentImage, setCurrentImage] = useState(0);
  const heroBannerImages = [
    { url: "/Picture/northindia.jpg", title: "Explore Traditions" },
    { url: "/Picture/southindia.jpg", title: "Coastline Flavors" },
    { url: "/Picture/beverages.jpg", title: "Refresh Your Soul" },
    { url: "/Picture/dessert.jpg", title: "Sweet Moments" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroBannerImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setLoading(true);
    const isTopTen = location.state?.isTopTen;
    const url = isTopTen ? `${API_BASE_URL}/Recipes/top?count=10` : `${API_BASE_URL}/Recipes`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Shuffle the recipes array if not in top ten mode
        const finalData = isTopTen ? data : data.sort(() => 0.5 - Math.random());
        setRecipes(finalData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching recipes:", err);
        setLoading(false);
      });
  }, [location.state]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/Categories`)
      .then(res => res.json())
      .then(data => {
        setCategoryList(["All", ...data.map(c => c.name)]);
      })
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      authFetch(`${API_BASE_URL}/UserActivity/saved/${userId}`)
        .then(res => res.json())
        .then(data => {
          setSavedRecipeIds(data.map(r => r.id));
        })
        .catch(err => console.error("Error fetching saved recipes:", err));
    }
  }, []);

  const handleSave = async (recipeId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast.error("Please login to save recipes");
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/UserActivity/toggle-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          recipeId: recipeId
        }),
      });

      if (response.ok) {
        setSavedRecipeIds(prev =>
          prev.includes(recipeId)
            ? prev.filter(id => id !== recipeId)
            : [...prev, recipeId]
        );
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
    }
  };

  if (showCreate) {
    return <CreateRecipe onBack={() => setShowCreate(false)} />;
  }

  const filteredRecipes = recipes.filter(r => {
    const categoryMatch = activeCategory === "All" || r.category === activeCategory;
    const levelMatch = activeLevel === "All" || (r.level || "Medium") === activeLevel;
    return categoryMatch && levelMatch;
  });

  return (
    <>
      <Navbar onCreateClick={() => setShowCreate(true)} />

      {/* Dynamic Banner Slider */}
      <div className="relative w-full h-[400px] overflow-hidden mt-0">
        <div className="absolute inset-0">
          <img
            src={heroBannerImages[currentImage].url}
            alt="Banner"
            className="w-full h-full object-cover transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-orange-900/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <h2 className="text-7xl font-bold mb-4 drop-shadow-2xl tracking-tight">
            {location.state?.isTopTen ? "Top 10 Recipes" : heroBannerImages[currentImage].title}
          </h2>
          <div className="w-24 h-1.5 bg-orange-500 rounded-full mb-6 shadow-lg"></div>
          <p className="text-xl font-medium text-orange-50 drop-shadow-md">
            {location.state?.isTopTen ? "Hand-picked culinary masterpieces just for you" : `Discover ${filteredRecipes.length} curated recipes for you`}
          </p>
        </div>

        <div className="absolute top-6 left-6 z-40 flex gap-4">
          <button
            onClick={() => navigate("/Home")}
            className="group p-3 bg-white/20 backdrop-blur-md text-white border border-white/30 rounded-full font-bold shadow-md hover:bg-white hover:text-orange-600 transition-all duration-500 flex items-center justify-center"
            title="Go to Home"
          >
            <MdHome className="transition-transform duration-300" size={24} />
          </button>
          {location.state?.isTopTen && (
            <button
              onClick={() => {
                navigate("/Home/Recipes", { state: null });
                window.location.reload(); // Force reload to clear top-ten mode
              }}
              className="bg-orange-600/80 backdrop-blur-md text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-xl hover:bg-orange-500 transition-all flex items-center gap-2"
            >
              Show All Recipes
            </button>
          )}
        </div>

        <div className="absolute bottom-6 right-8 flex gap-2">
          {heroBannerImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`w-2 h-2 rounded-full transition-all ${idx === currentImage ? "bg-orange-500 w-6" : "bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white">
        <section id="recipes" className="py-16 px-6 bg-white">
          <div className="max-w-7xl mx-auto">


            {/* Category Filters - Horizontal Sliding */}
            <div className="flex flex-nowrap justify-start gap-3 md:gap-5 mb-8 overflow-x-auto scrollbar-hide pb-2 px-2 md:px-12 relative z-10 w-full snap-x snap-proximity">
              {categoryList.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`relative px-6 md:px-8 py-2.5 md:py-3 rounded-[2rem] font-bold text-sm md:text-[16px] transition-all duration-300 whitespace-nowrap flex-shrink-0 border flex items-center justify-center group ${activeCategory === category
                    ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white border-transparent shadow-[0_8px_20px_max(0px,rgba(249,115,22,0.3))]"
                    : "bg-white text-gray-600 border-gray-100/80 shadow-[0_2px_10px_max(0px,rgba(0,0,0,0.03))] hover:shadow-[0_8px_20px_max(0px,rgba(249,115,22,0.1))] hover:text-orange-600 hover:border-orange-200"
                    }`}
                >
                  {activeCategory === category && (
                    <span className="absolute inset-0 bg-white/20 blur-md rounded-full pointer-events-none" />
                  )}
                  <span className="relative z-10 tracking-wide">{category}</span>
                </button>
              ))}
            </div>

            {/* Difficulty Filters - Level Selection */}
            <div className="flex flex-nowrap justify-start gap-4 mb-14 overflow-x-auto scrollbar-hide pb-4 px-2 md:px-12 relative z-10 w-full">
              <div className="flex items-center gap-3 bg-orange-50/50 p-1.5 rounded-[2.5rem] border border-orange-100 shadow-sm">
                {difficultyLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`px-6 py-2 rounded-full font-bold text-[13px] uppercase tracking-wider transition-all duration-300 ${activeLevel === level
                      ? "bg-white text-orange-600 shadow-md transform scale-105"
                      : "text-gray-500 hover:text-orange-400"
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {loading ? (
                <div className="col-span-full text-center py-20">
                  <p className="text-2xl text-orange-400 font-medium">Loading recipes...</p>
                </div>
              ) : filteredRecipes.map((recipe, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-orange-100 overflow-hidden flex flex-col h-full"
                >
                    <div 
                      className="relative h-52 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/ViewRecipe/${recipe.id}`)}
                    >
                      <img
                        src={recipe.imageUrl || "/Picture/paneer.jpg"}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"; }}
                      />
                    </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-orange-600 line-clamp-2 min-h-[3rem] leading-tight flex-grow">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-3 text-gray-500 font-medium text-sm">
                        <div className="flex items-center gap-1.5">
                          <MdOutlineTimer size={18} className="text-orange-500" />
                          <span>{recipe.cookingTime}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="uppercase tracking-widest font-bold text-[10px]">{recipe.level || "Medium"}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => navigate(`/ViewRecipe/${recipe.id}`)}
                        className="flex-1 bg-orange-50 hover:bg-orange-500 text-orange-700 hover:text-white py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border border-orange-100/50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleSave(recipe.id)}
                        className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border ${savedRecipeIds.includes(recipe.id)
                          ? "bg-orange-500 text-white border-orange-500"
                          : "bg-white text-gray-700 border-gray-100 hover:bg-orange-500 hover:text-white hover:border-orange-500"
                          }`}
                      >
                        {savedRecipeIds.includes(recipe.id) ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredRecipes.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-2xl text-orange-400 font-medium">No recipes found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

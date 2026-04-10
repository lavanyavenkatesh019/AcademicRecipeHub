import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineSave } from "react-icons/hi";
import { Heart } from "lucide-react";
import { MdOutlineTimer, MdArrowBack, MdStar, MdStarBorder } from "react-icons/md";
import { FaStar, FaRegStar } from "react-icons/fa";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import { authFetch } from '../utils/authUtils';
import toast from 'react-hot-toast';
import { API_BASE_URL } from "../utils/apiConfig";

const recipesData = [
  { id: 1, name: "Crispy Dosa", category: "Breakfast", image: "/Picture/dosa.jpg", time: "20 mins", calories: "120 kcal", ingredients: ["1 cup rice", "1/2 cup urad dal", "Salt to taste", "Water as needed", "Oil for cooking"], preparation: ["Soak rice and urad dal for 6 hours.", "Grind into smooth batter and ferment overnight.", "Heat a tawa and spread batter thinly.", "Drizzle oil and cook until crispy.", "Serve hot with chutney and sambar."] },
  { id: 2, name: "Mango Lassi", category: "Veg", image: "/Picture/mango.jpg", time: "10 mins", calories: "180 kcal", ingredients: ["1 cup ripe mango pulp", "1 cup yogurt", "2 tbsp sugar", "1/4 cup milk", "Ice cubes"], preparation: ["Add mango pulp, yogurt, sugar, and milk into blender.", "Blend until smooth.", "Add ice cubes and blend again.", "Pour into glasses and serve chilled."] },
  { id: 3, name: "Paneer Tikka", category: "Veg", image: "/Picture/paneer.jpg", time: "25 mins", calories: "250 kcal", ingredients: ["200g paneer cubes", "1/2 cup yogurt", "1 tsp red chili powder", "1 tsp garam masala", "Capsicum & onion cubes", "Salt to taste"], preparation: ["Mix yogurt and spices to prepare marinade.", "Add paneer and vegetables, coat well.", "Marinate for 30 minutes.", "Grill or bake at 200°C for 15 minutes.", "Serve hot with mint chutney."] },
  { id: 4, name: "Pav Bhaji", category: "Veg", image: "/Picture/pavbhaji.jpg", time: "30 mins", calories: "300 kcal", ingredients: ["Pav buns", "2 Potatoes, boiled", "1/2 cup peas", "Tomatoes & Onions", "Pav bhaji masala", "Butter"], preparation: ["Mash boiled vegetables.", "Sauté onions, tomatoes, and spices in butter.", "Mix in mashed veggies and simmer.", "Toast pav buns in butter.", "Serve hot with lemon wedges and diced onion."] },
  { id: 5, name: "Idli Sambar", category: "Breakfast", image: "/Picture/IdliSambhar.jpg", time: "15 mins", calories: "150 kcal", ingredients: ["Idli batter", "Toor dal", "Mixed vegetables", "Tamarind extract", "Sambar powder", "Mustard seeds & curry leaves"], preparation: ["Steam idli batter in molds for 10-12 mins.", "Pressure cook dal and vegetables.", "Boil tamarind water with sambar powder.", "Mix cooked dal and temper with mustard seeds.", "Serve hot idlis dipped in sambar."] },
  { id: 6, name: "Veg Sandwich", category: "Breakfast", image: "/Picture/sandwitch.jpg", time: "10 mins", calories: "220 kcal", ingredients: ["Bread slices", "Sliced cucumber & tomato", "Green chutney", "Butter", "Cheese slice (optional)", "Chat masala"], preparation: ["Apply butter and chutney to bread slices.", "Arrange vegetable slices.", "Sprinkle chat masala.", "Cover with another slice and grill or serve fresh.", "Cut into preferred shapes."] },
  { id: 7, name: "Veg Momos", category: "Veg", image: "/Picture/vegmomos.jpg", time: "20 mins", calories: "180 kcal", ingredients: ["1 cup all-purpose flour", "Finely chopped cabbage", "Grated carrot", "Soy sauce", "Minced garlic & ginger", "Salt and pepper"], preparation: ["Knead flour into a soft dough.", "Sauté vegetables with garlic, ginger, and soy sauce.", "Roll small dough circles and fill with veg mixture.", "Fold and seal the edges.", "Steam for 10-12 minutes and serve with spicy dip."] },
  { id: 8, name: "Tomato Soup", category: "Veg", image: "/Picture/soup.jpg", time: "15 mins", calories: "90 kcal", ingredients: ["4 large tomatoes", "1/2 onion, chopped", "Garlic cloves", "1 tbsp butter", "Salt & black pepper", "Cream (for garnish)"], preparation: ["Sauté garlic and onions in butter.", "Add chopped tomatoes and cook until soft.", "Blend the mixture into a smooth puree.", "Strain and simmer, adding salt and pepper.", "Serve hot, garnished with cream and croutons."] },
  { id: 9, name: "Chicken Biryani", category: "Non-Veg", image: "/Picture/chickenbiryani.jpg", time: "45 mins", calories: "450 kcal", ingredients: ["Basmati rice", "Chicken pieces", "Biryani masala", "Yogurt", "Fried onions", "Saffron milk"], preparation: ["Marinate chicken in yogurt and spices.", "Partially cook basmati rice with whole spices.", "Layer chicken and rice in a heavy-bottomed pot.", "Top with fried onions and saffron milk.", "Seal and cook on low heat (dum) for 25 minutes."] },
  { id: 10, name: "Egg Curry", category: "Non-Veg", image: "/Picture/eggcurry.jpg", time: "30 mins", calories: "280 kcal", ingredients: ["4 Hard-boiled eggs", "2 Onions, finely chopped", "Tomatoes, pureed", "Ginger-garlic paste", "Turmeric, red chili powder", "Garam masala"], preparation: ["Make shallow slits on boiled eggs and pan-fry slightly.", "Sauté onions until golden brown, add ginger-garlic paste.", "Add tomato puree and dry spices, cook until oil separates.", "Add water to make a gravy and let it boil.", "Drop in the eggs, simmer for 5 mins, and serve."] },
  { id: 11, name: "Butter Chicken", category: "Non-Veg", image: "/Picture/butterchicken.jpg", time: "30 mins", calories: "450 kcal", ingredients: ["500g bone-less chicken", "1 cup tomato puree", "1/2 cup heavy cream", "2 tbsp butter", "Garam masala & kasuri methi", "Ginger-garlic paste"], preparation: ["Marinate chicken in yogurt and spices for 2 hours.", "Grill or pan-fry chicken until fully cooked.", "In a pan, melt butter and sauté ginger-garlic paste.", "Add tomato puree and spices, cook until oil separates.", "Add the cooked chicken, stir in cream and simmer for 5 mins."] }
];

const ViewRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedRecipes, setRelatedRecipes] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Inappropriate Content");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleReportSubmit = async () => {
    if (!userId) {
      toast.error("Please login to report a recipe.");
      return;
    }

    setIsSubmittingReport(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/Reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId: parseInt(id),
          reason: reportReason,
          description: reportDescription
        }),
      });

      if (response.ok) {
        toast.success("Report submitted successfully. Thank you for helping us keep the community safe!");
        setShowReportModal(false);
        setReportReason("Inappropriate Content");
        setReportDescription("");
      } else {
        const errorData = await response.json();
        toast.error(`Failed to submit report: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("An error occurred while submitting the report.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/Recipes/${id}`)
      .then(res => res.json())
      .then(data => {
        // Parse ingredients and instructions if they are strings
        const processedRecipe = {
          ...data,
          ingredients: data.ingredients 
            ? (data.ingredients.includes('.') && /\d+\./.test(data.ingredients)
                ? data.ingredients.split(/\d+\./).filter(s => s.trim()).map(s => s.trim())
                : data.ingredients.split(',').map(i => i.trim()).filter(i => i !== ""))
            : [],
          preparation: data.instructions ? data.instructions.split(/\d+\./).filter(s => s.trim()).map(s => s.trim()) : []
        };
        setRecipe(processedRecipe);
        
        // Fetch all recipes to find related ones
        fetch(`${API_BASE_URL}/Recipes`)
          .then(res => res.json())
          .then(allRecipes => {
            // Using data.category directly to avoid race condition with state
            const related = allRecipes
              .filter(r => r.category === data.category && r.id !== Number(id))
              .slice(0, 4);
            setRelatedRecipes(related);
            setLoading(false);
          })
          .catch(err => {
            console.error("Error fetching related recipes:", err);
            setLoading(false);
          });
      })
      .catch(err => {
        console.error("Error fetching recipe:", err);
        setLoading(false);
      });

    // Fetch user's rating if logged in
    if (userId) {
      authFetch(`${API_BASE_URL}/Ratings/user-rating/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.ratingValue) {
            setUserRating(data.ratingValue);
          }
        })
        .catch(err => console.error("Error fetching user rating:", err));
    }
  }, [id, userId]);

  const handleRate = async (rating) => {
    if (!userId) {
      toast.error("Please login to rate recipes.");
      return;
    }

    try {
      const response = await authFetch(`${API_BASE_URL}/Ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipeId: parseInt(id),
          ratingValue: rating
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserRating(rating);
        setRecipe(prev => ({ ...prev, rating: data.newAverage }));
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const [likes, setLikes] = useState(() => {
    return parseInt(localStorage.getItem(`likes_${id}`)) || Math.floor(Math.random() * 50) + 12;
  });

  const [liked, setLiked] = useState(() => {
    const favs = JSON.parse(localStorage.getItem("favoriteRecipes") || "[]");
    return favs.some(r => r.id === Number(id));
  });

  const [saved, setSaved] = useState(() => {
    const savedRecs = JSON.parse(localStorage.getItem("savedRecipes") || "[]");
    return savedRecs.some(r => r.id === Number(id));
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const toggleFavorite = async () => {
    if (!recipe || !userId) return;
    
    try {
      const response = await authFetch(`${API_BASE_URL}/UserActivity/toggle-like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          recipeId: recipe.id
        }),
      });

      if (response.ok) {
        setLiked(!liked);
        setLikes(prev => liked ? prev - 1 : prev + 1);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const toggleSave = async () => {
    if (!recipe || !userId) return;
    
    try {
      const response = await authFetch(`${API_BASE_URL}/UserActivity/toggle-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          recipeId: recipe.id
        }),
      });

      if (response.ok) {
        setSaved(!saved);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <p className="text-2xl text-orange-400 font-medium">Loading recipe...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center flex-col gap-6">
        <h2 className="text-3xl font-bold text-orange-900">Recipe not found.</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-orange-500 text-white rounded-full font-bold shadow-lg hover:bg-orange-600 transition">Go Back</button>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-orange-50/50 pb-24">
        
        {/* Subtle Hero Header */}
        <div className="w-full h-[45vh] lg:h-[55vh] relative overflow-hidden">
          <img src={recipe.imageUrl || "/Picture/paneer.jpg"} alt={recipe.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-orange-900/90 via-orange-900/40 to-black/20"></div>
          
          <div className="absolute top-6 left-6 z-10">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-orange-500 hover:border-orange-500 transition-all duration-300"
            >
              <MdArrowBack className="group-hover:-translate-x-1 transition-transform" size={20}/>
              Back
            </button>
          </div>

          <div className="absolute bottom-0 left-0 w-full px-6 pb-20 pt-8 max-w-7xl mx-auto flex flex-col items-start translate-x-1/2 right-1/2" style={{transform: "translateX(-50%)"}}>
             <div className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-4 shadow-md">
               {recipe.category}
             </div>
             <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-2 drop-shadow-xl">
               {recipe.title}
             </h1>
          </div>
        </div>

        {/* Recipe Content Area */}
        <div className="max-w-7xl mx-auto -mt-16 relative z-20 px-4 md:px-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-6 md:p-12 border border-orange-100/50">
            
            {/* Action Bar */}
            <div className="flex flex-wrap justify-between items-center mb-10 pb-8 border-b border-orange-100 gap-6">
              <div className="flex flex-wrap px-5 py-3 bg-orange-50 border border-orange-100/50 rounded-2xl gap-8 shadow-sm">
                <div className="flex items-center gap-3 text-orange-900 font-semibold">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <MdOutlineTimer className="text-orange-500 text-xl" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-500/80 uppercase tracking-widest font-bold">Prep Time</p>
                    <p className="text-lg">{recipe.cookingTime}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-orange-900 font-semibold">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <span className="text-xl">🔥</span>
                  </div>
                  <div>
                    <p className="text-xs text-orange-500/80 uppercase tracking-widest font-bold">Difficulty</p>
                    <p className={`text-lg font-bold ${
                      recipe.level === "Easy" ? "text-emerald-600" :
                      recipe.level === "Hard" ? "text-rose-600" :
                      "text-orange-600"
                    }`}>
                      {recipe.level || "Medium"}
                    </p>
                  </div>
                </div>
               <div className="flex flex-col gap-2">
                  <p className="text-xs text-orange-500/80 uppercase tracking-widest font-bold px-1">Rate this recipe</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRate(star)}
                        className="transition-transform hover:scale-125 focus:outline-none"
                      >
                        {star <= (hoverRating || userRating) ? (
                          <FaStar className="text-yellow-400 text-3xl drop-shadow-sm" />
                        ) : (
                          <FaRegStar className="text-gray-300 text-3xl" />
                        )}
                      </button>
                    ))}
                  </div>
                  {recipe.rating > 0 && (
                    <p className="text-sm font-medium text-gray-500 mt-1">Average: {recipe.rating.toFixed(1)} / 5.0</p>
                  )}
               </div>
              </div>

              <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto">
               <button
                  onClick={toggleFavorite}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                    liked ? "bg-red-50 text-red-500 border border-red-200 shadow-inner" : "bg-white text-gray-600 border border-gray-200 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200"
                  }`}
                >
                  <Heart size={20} className={liked ? "fill-red-500 text-red-500" : ""} />
                  <span className="whitespace-nowrap">{likes} {likes === 1 ? "Like" : "Likes"}</span>
                </button>
                <button 
                  onClick={toggleSave}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-3 rounded-2xl font-bold transition-all duration-300 ${
                    saved ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-white text-gray-600 border border-gray-200 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200"
                  }`}
                >
                  <HiOutlineSave size={22} />
                  <span className="whitespace-nowrap">{saved ? "Saved" : "Save Recipe"}</span>
                </button>

                <button 
                  onClick={() => setShowReportModal(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold bg-white text-red-500 border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all duration-300 shadow-sm"
                >
                  <span className="text-xl">🚩</span>
                  Report
                </button>
              </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <span className="text-3xl">🚩</span> Report Recipe
                    </h3>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Reason for reporting</label>
                        <select 
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none bg-gray-50"
                        >
                          <option value="Inappropriate Content">Inappropriate Content</option>
                          <option value="Wrong Ingredients">Wrong Ingredients</option>
                          <option value="Spam">Spam</option>
                          <option value="Offensive Language">Offensive Language</option>
                          <option value="Health/Safety Issue">Health/Safety Issue</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Description</label>
                        <textarea 
                          value={reportDescription}
                          onChange={(e) => setReportDescription(e.target.value)}
                          placeholder="Please provide more details..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none bg-gray-50 h-32 resize-none"
                        ></textarea>
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button 
                        onClick={() => setShowReportModal(false)}
                        className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleReportSubmit}
                        disabled={isSubmittingReport}
                        className="flex-1 py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all disabled:opacity-50"
                      >
                        {isSubmittingReport ? "Submitting..." : "Submit Report"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Layout Grid */}
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              
              {/* Ingredients Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-b from-orange-50/80 to-white border border-orange-100 rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-2xl font-extrabold text-orange-900 mb-6 flex items-center gap-2">
                    🛒 Ingredients
                  </h3>
                  <ul className="space-y-4">
                    {recipe.ingredients.map((item, index) => (
                      <li key={index} className="flex items-start gap-4 text-gray-800 font-medium pb-4 border-b border-orange-100/50 last:border-0 last:pb-0 group">
                        <div className="w-8 h-8 shrink-0 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                          {index + 1}
                        </div>
                        <span className="leading-relaxed pt-1.5">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Instructions Area */}
              <div className="lg:col-span-2">
                <h3 className="text-3xl font-extrabold text-orange-900 mb-8 mt-2 lg:mt-0 flex items-center gap-3">
                  👩‍🍳 Instructions
                </h3>
                <div className="space-y-8">
                  {recipe.preparation.map((step, index) => (
                    <div key={index} className="flex gap-6 group bg-white hover:bg-orange-50 p-4 -ml-4 rounded-3xl transition-colors duration-300">
                      <div className="shrink-0 w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-extrabold text-xl group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-md transition-all duration-300">
                        {index + 1}
                      </div>
                      <p className="text-lg text-gray-700 leading-relaxed pt-2.5 font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Related Recipes Section */}
        <div className="max-w-7xl mx-auto mt-24 px-4 md:px-6">
          <div className="flex justify-between items-end mb-10 pb-4 border-b-2 border-orange-100">
            <h2 className="text-3xl font-extrabold text-orange-900">You Might Also Like</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedRecipes.map((relRecipe, idx) => (
              <motion.div 
                key={idx} 
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/ViewRecipe/${relRecipe.id}`)}
                className="group bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-2xl transition-all duration-300 border border-orange-100 overflow-hidden cursor-pointer flex flex-col"
              >
                <div className="relative h-56 overflow-hidden rounded-t-[2rem]">
                  <img
                    src={relRecipe.imageUrl || "/Picture/paneer.jpg"}
                    alt={relRecipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-orange-600 shadow-sm">
                    {relRecipe.category}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors mb-3 line-clamp-1">
                      {relRecipe.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mt-2 bg-orange-50/50 w-fit px-3 py-1.5 rounded-full border border-orange-100">
                    <MdOutlineTimer size={18} className="text-orange-500"/>
                    <span>{relRecipe.cookingTime}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
};

export default ViewRecipe;
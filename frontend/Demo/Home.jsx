import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaTwitter, FaEnvelope, FaWhatsapp, FaFire, FaUtensils, FaBookOpen, FaUsers } from "react-icons/fa";
import { FaUser, FaPaperPlane } from "react-icons/fa6"; 
import Navbar from "./Navbar";
import { FaStar, FaRegStar, FaArrowRight } from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";
import CreateRecipe from './CreateRecipe';
import { motion } from "framer-motion";
import LogoIcon from "./LogoIcon";
import { API_BASE_URL } from "../utils/apiConfig";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const hoverScale = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.3 } }
};

const RecipeApp = () => {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopRecipes = () => {
    setLoading(true);
    fetch(`${API_BASE_URL}/Recipes/top?count=4`)
      .then((res) => res.json())
      .then((data) => {
        setTrendingRecipes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching top recipes:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTopRecipes();
  }, []);
  
  const heroImages = [
    { url: "/Picture/Home1.jpg", title: "Healthy Organic Food", subtitle: "Discover fresh and healthy recipes made with natural ingredients." },
    { url: "/Picture/northindia.jpg", title: "Authentic North Indian", subtitle: "Rich spices and traditional flavors from the heart of India." },
    { url: "/Picture/southindia.jpg", title: "Coastal South Indian", subtitle: "Light, healthy, and flavorful dishes from the southern coast." },
    { url: "/Picture/dessert.jpg", title: "Sweet Indulgences", subtitle: "Delicious desserts to satisfy your cravings." }
  ];

  const [currentHero, setCurrentHero] = useState(0);

  useEffect(() => {
    document.body.classList.add('no-scrollbar');
    return () => document.body.classList.remove('no-scrollbar');
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (showCreate) {
    return <CreateRecipe onBack={() => setShowCreate(false)} />;
  }
 
  return (            
    <div className="overflow-x-hidden">
        <Navbar onCreateClick={() => setShowCreate(true)} />
        
        {/* HERO SECTION WITH CAROUSEL */}
        <section className="relative w-full h-[90vh] overflow-hidden">
          <motion.div
            key={currentHero}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[currentHero].url}
              alt={heroImages[currentHero].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </motion.div>
         
          <div className="relative z-10 max-w-7xl mx-auto h-full flex items-center px-6">
            <motion.div 
              key={`content-${currentHero}`}
              className="max-w-2xl"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="uppercase tracking-widest text-orange-200 mb-4 font-semibold text-sm">
                Organic • Fresh • Healthy
              </p>
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
                {heroImages[currentHero].title}
              </h1>
              <p className="text-lg text-white mb-8 drop-shadow-md">
                {heroImages[currentHero].subtitle}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/Home/Recipes")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold shadow-xl flex items-center gap-3 transition-colors"
              >
                Explore Recipes <FaArrowRight />
              </motion.button>
            </motion.div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {heroImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHero(idx)}
                className={`w-3 h-3 rounded-full transition-all ${idx === currentHero ? "bg-orange-500 w-8" : "bg-white/50 hover:bg-white"}`}
              />
            ))}
          </div>
        </section>
      
        {/* CATEGORIES SECTION */}
        <section id="categories" className="py-12 px-6 bg-amber-50/30">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-orange-900 mb-4">
                Our Categories
              </h2>
              <p className="text-orange-700/80 text-lg max-w-2xl mx-auto">Explore flavors from around the world curated just for you.</p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="flex gap-8 overflow-x-auto scrollbar-hide pb-8 px-4"
            >
              {[
                { name: "North Indian", image: "/Picture/northindia.jpg" },
                { name: "South Indian", image: "/Picture/southindia.jpg" },
                { name: "Desserts", image: "/Picture/dessert.jpg" },
                { name: "Veg", image: "/Picture/vegan.jpg" },
                { name: "Non-Veg", image: "/Picture/nonveg.jpg" },
                { name: "Beverages", image: "/Picture/beverages.jpg" },
              ].map((category, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeIn}
                  whileHover="hover"
                  initial="rest"
                  onClick={() => navigate("/Home/Recipes", { state: { category: category.name } })}
                  className="min-w-[280px] group cursor-pointer rounded-3xl bg-white shadow-xl hover:shadow-2xl transition-all border border-orange-100 overflow-hidden"
                >
                  <motion.div variants={hoverScale} className="relative h-56 overflow-hidden rounded-t-3xl">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                  <div className="p-6 text-center transform transition-transform duration-300 group-hover:-translate-y-2">
                    <h3 className="text-2xl font-bold text-orange-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {category.name}
                    </h3>
                    <div className="w-16 h-1 mx-auto bg-gradient-to-r from-orange-400 to-orange-600 rounded-full mb-3 shadow-sm" />
                    <p className="text-orange-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      Explore Now <FaArrowRight size={12} />
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* TOP RECIPES SECTION */}
        <section id="recipes" className="py-12 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex justify-between items-end mb-16"
            >
              <div>
                <div className="flex items-center gap-2 text-orange-500 font-bold mb-2 uppercase tracking-wider">
                   <FaFire /> Trending Now
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-orange-900">Top Recipes</h2>
              </div>
              <div className="flex gap-4">
                <button onClick={() => navigate("/Home/Recipes", { state: { isTopTen: true } })} className="hidden md:flex text-orange-600 font-bold hover:text-orange-800 transition-colors items-center gap-2">
                  View All <FaArrowRight />
                </button>
              </div>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {loading ? (
                <div className="col-span-full text-center py-10">
                  <p className="text-xl text-orange-400 font-medium">Loading recipes...</p>
                </div>
              ) : trendingRecipes.length > 0 ? (
                trendingRecipes.map((recipe, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -10 }}
                    onClick={() => navigate(`/ViewRecipe/${recipe.id}`)}
                    className="group relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(255,107,0,0.15)] transition-all duration-500 border border-orange-100/50 overflow-hidden cursor-pointer flex flex-col"
                  >
                    <div 
                      className="relative h-64 overflow-hidden cursor-pointer"
                      onClick={() => navigate(`/ViewRecipe/${recipe.id}`)}
                    >
                      <img
                        src={recipe.imageUrl || "/Picture/paneer.jpg"}
                        alt={recipe.title}
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop"; }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-orange-600 shadow-sm flex items-center gap-1 z-10">
                        <FaStar className="text-amber-400"/> {recipe.rating}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors mb-3 line-clamp-1">
                        {recipe.title}
                      </h3>

                      <div className="flex items-center gap-4 text-gray-500 font-medium text-sm mb-6">
                        <div className="flex items-center gap-1">
                          <MdOutlineTimer size={18} className="text-orange-500" />
                          <span>{recipe.cookingTime}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="uppercase tracking-widest font-bold text-[10px]">{recipe.level || "Medium"}</span>
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/ViewRecipe/${recipe.id}`); }}
                        className="w-full bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white py-3 px-6 rounded-2xl font-bold text-md transition-all duration-300">
                        View Recipe
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">No recipes found.</div>
              )}
            </motion.div>
          </div>
        </section>

        {/* WHY CHOOSE RECIPE HUB SECTION */}
        <section className="py-16 px-6 bg-gradient-to-b from-amber-50/50 to-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-extrabold text-orange-900 mb-4">Why Choose RecipeHub?</h2>
              <p className="text-orange-700/80 text-lg max-w-2xl mx-auto">We make home cooking easier, healthier, and much more fun.</p>
            </motion.div>
            
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8"
            >
              {[
                { title: "Huge Recipe Collection", desc: "Thousands of tested recipes spanning multiple cuisines and dietary needs.", icon: <FaUtensils /> },
                { title: "Step-by-Step Guides", desc: "Clear instructions to make your cooking process seamless and fail-proof.", icon: <FaBookOpen /> },
                { title: "Vibrant Community", desc: "Connect with food lovers, share tips, and grow your culinary skills daily.", icon: <FaUsers /> }
              ].map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  variants={fadeIn}
                  whileHover={{ y: -10 }}
                  className="bg-white p-10 rounded-[2rem] border border-orange-100 shadow-xl hover:shadow-2xl hover:border-orange-200 transition-all duration-300 text-center group"
                >
                  <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center text-4xl mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-sm text-orange-400">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-2xl text-gray-900 mb-4 group-hover:text-orange-600 transition-colors">{feature.title}</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>   

        {/* STATISTICS COUNTER SECTION */}
        <section className="pt-12 pb-0 px-6 bg-white">
          <div className="max-w-7xl mx-auto border-y border-orange-100/50 pt-16 pb-12">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {[
                { label: "Healthy Recipes", value: "5k+", icon: <FaUtensils />, color: "text-orange-500" },
                { label: "Active Foodies", value: "10k+", icon: <FaUsers />, color: "text-blue-500" },
                { label: "Cooking Categories", value: "50+", icon: <FaBookOpen />, color: "text-emerald-500" },
                { label: "Community Rating", value: "4.8", icon: <FaStar />, color: "text-amber-500" }
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeIn}
                  className="flex flex-col items-center text-center group"
                >
                  <div className={`text-4xl mb-4 ${stat.color} transition-transform duration-500 group-hover:scale-125`}>
                    {stat.icon}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-1">
                    {stat.value}
                  </h2>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        <section id="about" className="pt-10 pb-28 px-6 bg-white relative overflow-hidden">
          {/* Decorative Pattern Overlay - Light Orange Dots */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #f97316 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            <div className="flex justify-center mb-10">
              <div className="bg-orange-50 p-6 rounded-full shadow-xl shadow-orange-100/50 border border-orange-100 transition-transform hover:scale-110 duration-500">
                <LogoIcon color="#f97316" className="h-24 w-24" />
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-orange-900 mb-8 tracking-tight">About RecipeHub</h2>
            <div className="w-24 h-1.5 bg-orange-500 mx-auto rounded-full mb-10 shadow-sm" />
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto font-medium">
              RecipeHub is your ultimate gateway to culinary discovery. 
              We empower you to find, create, and share authentic flavors from across the globe. 
              From homegrown traditions to contemporary masterpieces, find your perfect meal and join a community that celebrates the joy of cooking.
            </p>
          </motion.div>
        </section>
        
        {/* FOOTER */}
        <footer className="bg-gradient-to-br from-orange-600 to-orange-700 text-white relative overflow-hidden">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-orange-400 opacity-20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 pt-20 pb-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
              
              {/* Brand Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('home')}>
                  <LogoIcon color="white" className="h-14 w-14" />
                  <span className="text-4xl font-black tracking-tighter">RecipeHub</span>
                </div>
                <p className="text-orange-100 hover:text-white transition-colors leading-relaxed pt-2">
                  Your ultimate culinary companion. Discover, create, and share the most delicious recipes from around the world.
                </p>
                <div className="flex gap-4 pt-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-orange-600 hover:-translate-y-1 transition-all duration-300 shadow-sm"><FaFacebookF /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-orange-600 hover:-translate-y-1 transition-all duration-300 shadow-sm"><FaInstagram /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-orange-600 hover:-translate-y-1 transition-all duration-300 shadow-sm"><FaTwitter /></a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-orange-600 hover:-translate-y-1 transition-all duration-300 shadow-sm"><FaWhatsapp /></a>
                </div>
              </div>

              {/* Quick Links Column */}
              <div>
                <h4 className="text-xl font-bold mb-6 tracking-wider uppercase border-b-2 border-orange-500 pb-2 inline-block">Quick Links</h4>
                <ul className="space-y-4">
                  <li><a href="#" onClick={(e) => {e.preventDefault(); handleNav('home')}} className="text-orange-100 hover:text-white hover:translate-x-2 transition-transform inline-flex items-center gap-2"><FaArrowRight className="text-xs text-orange-300" /> Home</a></li>
                  <li><a href="#" onClick={(e) => {e.preventDefault(); handleNav('categories')}} className="text-orange-100 hover:text-white hover:translate-x-2 transition-transform inline-flex items-center gap-2"><FaArrowRight className="text-xs text-orange-300" /> Explore Categories</a></li>
                  <li><a href="#" onClick={(e) => {e.preventDefault(); handleNav('recipes')}} className="text-orange-100 hover:text-white hover:translate-x-2 transition-transform inline-flex items-center gap-2"><FaArrowRight className="text-xs text-orange-300" /> Latest Recipes</a></li>
                  <li><a href="#" onClick={(e) => {e.preventDefault(); handleNav('about')}} className="text-orange-100 hover:text-white hover:translate-x-2 transition-transform inline-flex items-center gap-2"><FaArrowRight className="text-xs text-orange-300" /> About Us</a></li>
                </ul>
              </div>

              {/* Top Categories Column */}
              <div>
                <h4 className="text-xl font-bold mb-6 tracking-wider uppercase border-b-2 border-orange-500 pb-2 inline-block">Top Picks</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-orange-100 hover:text-white hover:translate-x-2 transition-transform inline-flex items-center gap-2"><FaArrowRight className="text-xs text-orange-300" /> Healthy & Vegan</a></li>
                  <li><a href="#" className="text-orange-100 hover:text-white hover:translate-x-2 transition-transform inline-flex items-center gap-2"><FaArrowRight className="text-xs text-orange-300" /> Quick Breakfasts</a></li>
                  <li><a href="#" className="text-orange-100 hover:text-white hover:translate-x-2 transition-transform inline-flex items-center gap-2"><FaArrowRight className="text-xs text-orange-300" /> Decadent Desserts</a></li>
                  <li><a href="#" className="text-orange-100 hover:text-white hover:translate-x-2 transition-transform inline-flex items-center gap-2"><FaArrowRight className="text-xs text-orange-300" /> Special Dinners</a></li>
                </ul>
              </div>

              {/* Newsletter Column */}
              <div>
                <h4 className="text-xl font-bold mb-6 tracking-wider uppercase border-b-2 border-orange-500 pb-2 inline-block">Newsletter</h4>
                <p className="text-orange-100 mb-6 leading-relaxed">Subscribe for the latest sweet treats and savory eats directly in your inbox.</p>
                <form className="relative group" onSubmit={(e) => e.preventDefault()}>
                  <div className="flex bg-white/10 rounded-full p-1 border border-white/20 group-focus-within:border-white transition-colors">
                    <input type="email" placeholder="Your email address" className="bg-transparent text-white px-4 py-2 w-full focus:outline-none placeholder-orange-200/50" required />
                    <button type="submit" className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold hover:bg-orange-50 hover:scale-105 transition-all shadow-sm flex items-center justify-center">
                      <FaPaperPlane />
                    </button>
                  </div>
                </form>
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-orange-200">
              <p>© 2026 RecipeHub. All rights reserved.</p>
              <div className="flex gap-6 mt-6 md:mt-0">
                <a href="#" className="hover:text-white font-medium transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all after:duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-white font-medium transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all after:duration-300">Terms of Service</a>
                <a href="#" className="hover:text-white font-medium transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-white hover:after:w-full after:transition-all after:duration-300">Cookie Settings</a>
              </div>
            </div>
          </div>
        </footer>
    </div>
  )
}
export default RecipeApp;

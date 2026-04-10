import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUser, FaBars, FaTimes, FaSearch } from "react-icons/fa";
import { isAdmin as checkIsAdmin, logoutUser, authFetch } from '../utils/authUtils';
import toast from 'react-hot-toast';
import LogoIcon from "./LogoIcon";
import { API_BASE_URL } from "../utils/apiConfig";

const Navbar = ({ onCreateClick, onMenuClick }) => {

  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem("profilePicture"));
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  
  const username = localStorage.getItem("username");
  const isAdmin = checkIsAdmin();

  // Listen for storage changes to update profile picture across components
  useEffect(() => {
    const handleStorageChange = () => {
      setProfilePicture(localStorage.getItem("profilePicture"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleNav = (id) => {
    setMobileMenu(false);
    if (window.location.pathname === "/Home") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/Home#${id}`);
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/Login');
  };

  const handleSearch = async (e) => {
    if (e.key !== 'Enter' || !searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Recipes/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (response.ok) {
        const results = await response.json();
        if (results.length > 0) {
          // If match found, navigate to the first result
          navigate(`/ViewRecipe/${results[0].id}`);
          setSearchQuery(""); // Clear search
          setShowDropdown(false);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const response = await fetch(`${API_BASE_URL}/Recipes/search?q=${encodeURIComponent(searchQuery.trim())}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data.slice(0, 5)); // Show top 5
            setShowDropdown(true);
          }
        } catch (err) {
          console.error("Fetch error:", err);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click Outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white sticky top-0 z-50 transition-all duration-300">

  
      {/* Main Container */}
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

        <div className="flex-shrink-0 cursor-pointer flex items-center gap-2" onClick={() => navigate("/Home")}>
          <LogoIcon className="h-10 w-10 md:h-12 md:w-12 transition-transform hover:scale-110" />
          <span className="text-3xl font-black text-orange-600 tracking-tighter">
            RecipeHub
          </span>
        </div>

        {/* 2. Center Section: Navigation & Search */}
        <div className="hidden lg:flex flex-1 items-center justify-center gap-10">
          <div className="flex items-center gap-8">
            <Link to="/Home" className="text-sm font-bold text-orange-700 hover:text-orange-900 transition-colors uppercase tracking-wider">
              Home
            </Link>
            <button 
              onClick={() => handleNav('categories')}
              className="text-sm font-bold text-orange-700 hover:text-orange-900 transition-colors uppercase tracking-wider"
            >
              Categories
            </button>
            <button 
              onClick={() => handleNav('recipes')}
              className="text-sm font-bold text-orange-700 hover:text-orange-900 transition-colors uppercase tracking-wider"
            >
              Recipes
            </button>
            <button 
              onClick={() => handleNav('about')}
              className="text-sm font-bold text-orange-700 hover:text-orange-900 transition-colors uppercase tracking-wider"
            >
              About
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center bg-gray-50 border border-orange-50 px-4 py-2 rounded-full w-full max-w-[320px] relative focus-within:ring-2 focus-within:ring-orange-100 transition-all">
            <FaSearch className="text-orange-400 mr-2 text-sm"/>
            <input
              type="text"
              placeholder={isSearching ? "Searching..." : "Search recipes..."}
              className="bg-transparent outline-none w-full text-sm font-medium placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              onFocus={() => searchQuery.trim().length > 1 && setShowDropdown(true)}
              disabled={isSearching}
            />
            
            {/* Desktop Search Dropdown (Restored inside its container) */}
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 w-full mt-3 bg-white rounded-2xl shadow-2xl border border-orange-50 overflow-hidden z-[60] animate-in slide-in-from-top-2 duration-300"
              >
                {searchResults.length > 0 ? (
                  searchResults.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => {
                        navigate(`/ViewRecipe/${recipe.id}`);
                        setShowDropdown(false);
                        setSearchQuery("");
                      }}
                      className="w-full text-left px-5 py-4 hover:bg-orange-50 flex flex-col transition-colors border-b border-orange-50 last:border-0"
                    >
                      <span className="font-bold text-orange-950 text-sm">{recipe.title}</span>
                      <span className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">{recipe.category}</span>
                    </button>
                  ))
                ) : !isSearching && searchQuery.trim().length > 1 && (
                  <div className="px-5 py-6 text-center text-gray-500 font-medium text-sm">
                    No results for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Mobile Hamburger & Profile Section */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            className="lg:hidden text-2xl text-orange-600 p-2 hover:bg-orange-50 rounded-lg transition-colors"
            onClick={() => onMenuClick ? onMenuClick() : setMobileMenu(true)}
          >
            <FaBars />
          </button>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onCreateClick}
              className="hidden sm:block bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-100 hover:bg-orange-600 hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              + Create
            </button>

            <div className="relative">

              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white overflow-hidden border border-orange-200"
              >
                {profilePicture ? (
                  <img src={profilePicture} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <FaUser />
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl py-2 z-[70] border border-orange-100 overflow-hidden">
                  <div className="px-4 py-2 border-b border-gray-50 mb-1 bg-orange-50/30">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-bold text-orange-950 truncate">{username}</p>
                  </div>

                  <button
                    onClick={() => {
                      navigate(isAdmin ? "/Home/AdminPanel" : "/Home/UserDashboard");
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-orange-50 font-medium text-gray-700 transition-colors"
                  >
                    Dashboard
                  </button>

                  <div className="border-t border-gray-50 mt-1 pt-1">
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 font-medium text-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {mobileMenu && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileMenu(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300
        ${mobileMenu ? "translate-y-0" : "-translate-y-full"}`}
      >

        <div className="p-6 space-y-6">
          <button
            className="text-2xl"
            onClick={() => setMobileMenu(false)}
          >
            <FaTimes />
          </button>

          {/* Mobile Search */}
          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-xl relative">
            <FaSearch className="text-gray-400 mr-2"/>
            <input
              type="text"
              placeholder={isSearching ? "Searching..." : "Search..."}
              className="bg-transparent outline-none w-full text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e);
                  setMobileMenu(false);
                }
              }}
              onFocus={() => searchQuery.trim().length > 1 && setShowDropdown(true)}
              disabled={isSearching}
            />

            {/* Mobile Search Dropdown */}
            {showDropdown && mobileMenu && (
              <div 
                ref={mobileDropdownRef}
                className="absolute top-full left-0 w-full mt-1 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden z-[70]"
              >
                {searchResults.length > 0 ? (
                  searchResults.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => {
                        navigate(`/ViewRecipe/${recipe.id}`);
                        setShowDropdown(false);
                        setSearchQuery("");
                        setMobileMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 flex flex-col border-b border-orange-50 last:border-0"
                    >
                      <span className="font-bold text-orange-800 text-xs">{recipe.title}</span>
                      <span className="text-[10px] text-orange-400">{recipe.category}</span>
                    </button>
                  ))
                ) : !isSearching && searchQuery.trim().length > 1 && (
                  <div className="px-4 py-3 text-center text-gray-500 font-medium text-xs">
                    No matches found
                  </div>
                )}
              </div>
            )}
          </div>

          <Link to="/Home" className="block text-orange-700">
            Home
          </Link>

          <div 
            onClick={() => handleNav('categories')}
            className="text-orange-700 cursor-pointer"
          >
            Categories
          </div>

          <div 
            onClick={() => handleNav('recipes')}
            className="text-orange-700 cursor-pointer"
          >
            Recipes
          </div>

          <div 
            onClick={() => handleNav('about')}
            className="text-orange-700 cursor-pointer"
          >
            About
          </div>

          <div
            onClick={onCreateClick}
            className="text-orange-700 cursor-pointer"
          >
            Create
          </div>

          <div>
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              className="text-orange-700 cursor-pointer"
            >
              Profile
            </div>

            {profileOpen && (
              <div className="ml-4 mt-2 space-y-2">
                {isAdmin ? (
                  <div
                    onClick={() => navigate("/Home/AdminPanel")}
                    className="text-gray-600 cursor-pointer"
                  >
                    Admin Dashboard
                  </div>
                ) : (
                  <div
                    onClick={() => navigate("/Home/UserDashboard")}
                    className="text-gray-600 cursor-pointer"
                  >
                    User Dashboard
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;
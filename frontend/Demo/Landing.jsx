import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoIcon from "./LogoIcon";
const Landing = () => {

  const nav = useNavigate()

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
      >
        <source src="/Picture/recipe.mp4" type="video/mp4" />
      </video>

      <div className="absolute top-0 left-0 w-full h-full bg-black/50"></div>

      <div className="relative z-10 flex flex-col h-full">

        <div className="flex justify-between items-center px-6 py-4">

          <div className="cursor-pointer flex items-center gap-4 bg-transparent" onClick={() => nav("/Home")}>
            <LogoIcon color="white" className="h-16 w-16 transition-transform hover:scale-105" />
            <span className="text-4xl font-black text-white tracking-tighter">
              RecipeHub
            </span>
          </div>

          <div className="flex gap-3 sm:gap-5">

            <Link to="/Login">
              <button className="w-20 sm:w-24 h-9 sm:h-10 text-white rounded-2xl shadow-lg transition duration-300 hover:bg-amber-200 hover:text-black">
                Login
              </button>
            </Link>

            <Link to="/Signin">
              <button className="w-20 sm:w-24 h-9 sm:h-10 text-white rounded-2xl shadow-lg transition duration-300 hover:bg-amber-200 hover:text-black">
                Sign In
              </button>
            </Link>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-center items-center text-center px-4 gap-6">
          <h1 className="text-white text-3xl sm:text-5xl md:text-6xl font-bold">
            Your Kitchen, Your Stories.
          </h1>
          <Link to="/Home">
            <button className="text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-xl shadow-lg transition duration-300 hover:bg-amber-200 hover:text-black">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
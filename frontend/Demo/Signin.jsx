import React, { useState } from 'react'
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { registerUser } from '../utils/authUtils'
import toast from "react-hot-toast";

const Signin = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onsubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    
    try {
      const result = await registerUser(fullName, email, password);

      if (result.success) {
        toast.success("Account created successfully! Please log in.");
        navigate("/Login");
      } else {
        toast.error(result.message || "Failed to create account. Username might already exist.");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      toast.error("An error occurred. Is the API running?");
    }
  };

  return (
    <div>
        <div className='min-h-screen bg-[url(Picture//Dishimage.jpg)] bg-cover bg-right-top w-full'>
        <div id='view1fg' className='absolute w-full top-0 h-screen bg-white/10 backdrop-blur-none border border-white/20 rounded-lg p-6 shadow-lg  flex justify-center items-center'>
        <div className="w-full max-h-xl max-w-md mt-0 px-8 py-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
            <div className='h-15 mb-4'>
              <h1 className='flex justify-center text-white font-semibold text-3xl'>
                Create Account
              </h1>
            </div>
            <div className='flex flex-row space-x-5 mb-4'>
                <button type="button" className="w-full py-2 px-4 bg-white/30 text-white font-semibold rounded-lg hover:bg-white/40 transition duration-300 flex items-center justify-center gap-2">Sign In <FcGoogle className='text-xl'/></button>
                <button type="button" className="w-full py-2 px-4 bg-white/30 text-white font-semibold rounded-lg hover:bg-white/40 transition duration-300 flex items-center justify-center gap-2">Sign In <FaFacebookF className='text-xl'/></button>
            </div>

            <form className='flex flex-col space-y-4' onSubmit={onsubmit}>
                <div>
                    <label className="block mb-1 text-white font-medium">Username</label>
                    <input type="text" placeholder="Username" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"/>
                </div>
                <div>
                    <label className="block mb-1 text-white font-medium">E-mail</label>
                    <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"/>
                </div>
                <div>
                    <label className="block mb-1 text-white font-medium">Password</label>
                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"/>
                </div>
                
                <button type="submit" className="w-full py-2 mt-4 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition duration-300">Sign Up</button>
            </form>
            <p className="mt-6 text-center text-white/80 text-sm">
              Already have an account? 
              <span onClick={() => navigate('/Login')} className="underline hover:text-white cursor-pointer ml-1">Log in</span>
            </p>
        </div>
        </div>
        </div>
    </div>
  )
}

export default Signin

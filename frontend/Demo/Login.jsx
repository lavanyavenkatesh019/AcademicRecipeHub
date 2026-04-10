import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../utils/authUtils'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../utils/apiConfig'

const Login = () => {
  const navigate = useNavigate()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showForgotModal, setShowForgotModal] = useState(false);

  const onsubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await loginUser(username, password);
      
      if (result.success) {
        toast.success("Login successful!");
        navigate('/Home');
      } else {
        toast.error(result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("An error occurred. Is the API running?");
    }
  };
  return (
    <>
    <div>
        <div className='min-h-screen bg-[url(Picture//Dishimage.jpg)] bg-cover bg-right-top w-full'>
        <div id='view1fg' className='absolute w-full top-0 h-screen bg-white/10 backdrop-blur-none border border-white/20 rounded-lg p-6 shadow-lg  flex justify-center items-center'>
        <div className="w-full max-h-md max-w-md mt-0 px-8 py-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg">
            <div className='h-15'>
              <h1 className='flex justify-center text-white font-semibold text-3xl mb-4'>
                Login
              </h1>
            </div>
            <form onSubmit={onsubmit} className='flex flex-col space-y-5' >
                 <div>
                  <label className="block mb-1 text-white font-medium">Username</label>
                  <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} placeholder="Username"
                    className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"/>
                  </div>
                  <div>
                    <label className="block mb-1 text-white font-medium">Password</label>
                    <input type="password" value={password} placeholder="Password" onChange={(e)=>setPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white"/>
                  </div>
                   <button type="submit" className="w-full py-2 mt-4 px-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg transition duration-300">Log In</button>
            </form>
             <p className="mt-6 text-center text-white/80 text-sm flex flex-col gap-2">
               <div>
                 Don't have an account? 
                 <span onClick={() => navigate('/Signin')} className="underline hover:text-white cursor-pointer ml-1">Sign up</span>
               </div>
               <div>
                 <span onClick={() => setShowForgotModal(true)} className="underline hover:text-white cursor-pointer opacity-70 hover:opacity-100 transition-opacity">Forgot Password?</span>
               </div>
             </p>
                  
        </div>
        </div>
        </div>

        {showForgotModal && (
           <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
        )}
    </div>
    </>
  )
}

const ForgotPasswordModal = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, newPassword }),
      });

      if (response.ok) {
        toast.success("Password reset successfully! please login.");
        onClose();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
        <div className="bg-orange-500 p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Reset Password</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Username</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Confirm New Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-3.5 rounded-2xl bg-orange-500 text-white font-bold hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login

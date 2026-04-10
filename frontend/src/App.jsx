import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "../Demo/Landing";
import Login from "../Demo/Login";
import Signin from "../Demo/Signin";
import Home from "../Demo/Home";
import Recipes from "../Demo/Recipes";
import ViewRecipe from "../Demo/ViewRecipe";
import UserDashboard from "../Demo/UserDashboard";
import AdminPanel from "../Demo/AdminPanel";
import UserManagement from "../Demo/UserManagement";
import RecipeManagement from "../Demo/RecipeManagement";
import Reports from "../Demo/Reports";
import VeganRecipe from "../Demo/VeganRecipe";
import Protected from "../Demo/Protected";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signin" element={<Signin />} />
          
          <Route path="/Home" element={<Home />} />
          <Route path="/Home/Recipes" element={<Recipes />} />
          {/* Protected Routes */}
          <Route element={<Protected />}>
            <Route path="/Home/UserDashboard" element={<UserDashboard />} />
            
            {/* Admin Routes */}
            <Route path="/Home/AdminPanel" element={<AdminPanel />} />
            <Route path="/Home/UserManagement" element={<UserManagement />} />
            <Route path="/Home/RecipeManagement" element={<RecipeManagement />} />
            <Route path="/Home/Reports" element={<Reports />} />
          </Route>
          
          <Route path="/ViewRecipe/:id" element={<ViewRecipe />} />
          <Route path="/Vegan" element={<VeganRecipe />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { isAuthenticated } from "../utils/authUtils";

const Protected = () => {
  const nav = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log("User not authenticated - no JWT token found");
      nav("/Login");
    }
  }, [nav]);

  return <>
     <Outlet />
  </> 
};

export default Protected;
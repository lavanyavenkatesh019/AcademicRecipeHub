import { API_BASE_URL } from "./apiConfig";

export const loginUser = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);
      if (data.profilePicture) {
        localStorage.setItem("profilePicture", data.profilePicture);
      }
      return { success: true, ...data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, email }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, ...data };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
  localStorage.removeItem("profilePicture");
  window.location.href = "/Login";
};

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    logoutUser();
  }

  return response;
};

export const isAdmin = () => {
  return localStorage.getItem("role") === "Admin";
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

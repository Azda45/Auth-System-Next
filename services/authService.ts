import axios from "axios";

interface UserData {
  username?: string;
  email?: string;
  phonenumber?: string;
  password: string;
}

interface LoginData {
  login: string; // username or email
  password: string;
}

// Gunakan path relatif ke API routes Next.js
const API_URL = "/api/auth/";
const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const register = async (userData: UserData) => {
  try {
    const response = await axios.post(`${API_URL}register`, userData, {
      headers: {
        "X-API-KEY": PUBLIC_API_KEY, // Contoh jika kamu perlu mengirim API key ke server
      },
    });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const login = async (loginData: LoginData) => {
  try {
    const response = await axios.post(`${API_URL}login`, loginData, {
      headers: {
        "X-API-KEY": PUBLIC_API_KEY, // Contoh header API key
      },
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getCurrentUser = () => localStorage.getItem("token");

export const logout = () => localStorage.removeItem("token");

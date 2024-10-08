// /services/user.ts
import axios from "axios";

const API_URL = "/api/user";

// Add API Key to each request using Axios interceptor
axios.interceptors.request.use(
  (config) => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY; // Fetch API key from environment
    if (apiKey) {
      config.headers["x-api-key"] = apiKey; // Set API key in header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to get user data by UUID
export const getUserData = async (uuid: string) => {
  try {
    const response = await axios.get(`${API_URL}?uuid=${uuid}`);
    console.log("Response data:", response.data); // Debugging to view the response

    if (response.data && response.data.user) {
      // Return user data (uuid, username, email)
      return response.data.user;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

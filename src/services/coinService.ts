// /service/coin.ts
import axios from "axios";

const API_URL = "/api/v1/coin";

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

// Function to get coin balance by UUID
export const getCoins = async (uuid: string) => {
  try {
    const response = await axios.get(`${API_URL}?uuid=${uuid}`);
    return response.data.coins; // Return the coin amount
  } catch (error) {
    console.error("Error fetching coins:", error);
    throw error;
  }
};

// Function to update coin balance
export const updateCoins = async (uuid: string, coins: number) => {
  try {
    const response = await axios.post(API_URL, { uuid, coins });
    return response.data;
  } catch (error) {
    console.error("Error updating coins:", error);
    throw error;
  }
};

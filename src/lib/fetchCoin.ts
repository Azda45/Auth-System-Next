import { getCoins } from "../services/coinService";

export const fetchCoins = async (uuid: string) => {
  try {
    const userCoins = await getCoins(uuid);
    return userCoins;
  } catch (error) {
    console.error("Error fetching coin balance:", error);
    return null;
  }
};

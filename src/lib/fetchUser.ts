import { getUserData } from "../services/userService";

export const fetchUserData = async (uuid: string) => {
  try {
    const userData = await getUserData(uuid);
    return {
      uid: userData.uid,
      username: userData.username,
      email: userData.email,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

import { getUserData } from "../services/userService";

export const fetchUserData = async (uuid: string) => {
  try {
    const userData = await getUserData(uuid);
    return {
      username: userData.username,
      email: userData.email,
      phonenumber: userData.phonenumber,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

// utils/storageUtils.js
import AsyncStorage from "./storage";
import { getAllCoursesWithSubcollections } from "../services/getAllCoursesWithSubcollections";

export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem("@user_data", JSON.stringify(userData));
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

export const loadUserData = async () => {
  try {
    const storedUser = await AsyncStorage.getItem("@user_data");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error loading user data:", error);
    return null;
  }
};

export const loadCourses = async () => {
  try {
    const storedCourses = await AsyncStorage.getItem("@allCourses_data");

    if (storedCourses) {
      return JSON.parse(storedCourses);
    }

    const freshData = await getAllCoursesWithSubcollections();
    await AsyncStorage.setItem("@allCourses_data", JSON.stringify(freshData));
    return freshData;
  } catch (error) {
    console.error("Error loading course data:", error);
    return [];
  }
};
